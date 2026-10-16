import fs from "fs/promises";
import path from "path";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { sanitizeRepoId, validatePathSafety } from "../utils/pathSecurity.js";
import { buildDirectoryManifest } from "../utils/snapshotEngine.js";

async function PushFile(argv = {}) {
    console.log("Preparing to push local repository history to remote...");

    let s3Client;
    let bucketName;

    // Load AWS configuration
    try {
        const config = await import("../config/aws-config.js");
        s3Client = config.s3Client;
        bucketName = config.S3_BUCKET;
    } catch (error) {
        console.error("\n[Error] Could not load AWS configuration.");
        console.error(error.message);
        return;
    }

    if (!s3Client) {
        console.error("AWS S3 Client could not be initialized. Check config/aws-config.js.");
        return;
    }

    if (!bucketName) {
        console.error("S3 bucket name is missing. Please set S3_BUCKET_NAME in your environment.");
        return;
    }

    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");
    const headPath = path.join(repoPath, "head.json");
    const configPath = path.join(repoPath, "config.json");

    try {
        await fs.access(repoPath);
        await fs.access(commitsPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    // Resolve repository ID safely
    let repositoryId;
    try {
        const configRaw = await fs.readFile(configPath, "utf-8");
        repositoryId = JSON.parse(configRaw).repositoryId;
    } catch {
        repositoryId = argv.repoId || process.env.APNAGIT_REPO_ID;
    }

    if (!repositoryId) {
        console.error("Repository ID is not configured. Run 'node index.js init <repoId>' or specify in config.json.");
        return;
    }

    try {
        repositoryId = sanitizeRepoId(repositoryId);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return;
    }

    // Read local HEAD
    let localHeadCommit = null;
    try {
        const headRaw = await fs.readFile(headPath, "utf-8");
        localHeadCommit = JSON.parse(headRaw).currentCommit;
    } catch {}

    if (!localHeadCommit) {
        console.log("No commits found in local repository to push.");
        return;
    }

    const s3Prefix = `repositories/${repositoryId}`;
    const headKey = `${s3Prefix}/repo-state/head.json`;

    try {
        // Step 1: Pre-flight remote HEAD probe & concurrency check
        let remoteHeadData = null;
        let remoteHeadEtag = null;
        try {
            const headGetCmd = new GetObjectCommand({
                Bucket: bucketName,
                Key: headKey,
            });
            const headRes = await s3Client.send(headGetCmd);
            const headStr = await headRes.Body.transformToString();
            remoteHeadData = JSON.parse(headStr);
            remoteHeadEtag = headRes.ETag;
        } catch (err) {
            if (err.name !== "NoSuchKey" && err.$metadata?.httpStatusCode !== 404) {
                // If S3 returns another error (like permissions), let catch block handle it
                throw err;
            }
        }

        // Ancestry check
        if (remoteHeadData && remoteHeadData.currentCommit) {
            if (remoteHeadData.currentCommit === localHeadCommit) {
                console.log("Everything up-to-date.");
                return;
            }

            // Check if remote HEAD is an ancestor of local HEAD
            let isFastForward = false;
            let checkId = localHeadCommit;
            const visited = new Set();
            while (checkId && !visited.has(checkId)) {
                visited.add(checkId);
                if (checkId === remoteHeadData.currentCommit) {
                    isFastForward = true;
                    break;
                }
                try {
                    const metaRaw = await fs.readFile(path.join(commitsPath, checkId, "commit-metadata.json"), "utf-8");
                    checkId = JSON.parse(metaRaw).parentCommit;
                } catch {
                    break;
                }
            }

            if (!isFastForward) {
                console.error(`\n[Push Conflict] Remote HEAD (${remoteHeadData.currentCommit}) differs from local history.`);
                console.error("Updates were rejected because the remote contains work that you do not have locally.");
                console.error("Please run 'pull' first before pushing.");
                return;
            }
        }

        console.log(`\nUploading repository "${repositoryId}" to S3 bucket "${bucketName}"...`);

        // Step 2: Upload all commit directories and nested files
        const commitDirs = await fs.readdir(commitsPath, { withFileTypes: true });
        const directories = commitDirs.filter((e) => e.isDirectory());

        let uploadedFiles = 0;

        for (const commitDir of directories) {
            const commitName = commitDir.name;
            const commitDirPath = path.join(commitsPath, commitName);

            // Read metadata first
            const metaPath = path.join(commitDirPath, "commit-metadata.json");
            const metaContent = await fs.readFile(metaPath);
            const metaKey = `${s3Prefix}/commits/${commitName}/commit-metadata.json`;

            await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: metaKey,
                Body: metaContent
            }));
            uploadedFiles++;

            // Use buildDirectoryManifest to upload all files recursively
            const manifest = await buildDirectoryManifest(commitDirPath);
            for (const item of manifest) {
                const itemLocalPath = path.join(commitDirPath, item.path);
                const s3Key = `${s3Prefix}/commits/${commitName}/${item.path.replace(/\\/g, '/')}`;

                if (item.isSymlink) {
                    const linkBody = Buffer.from(`symlink:${item.target}`, "utf-8");
                    await s3Client.send(new PutObjectCommand({
                        Bucket: bucketName,
                        Key: s3Key,
                        Body: linkBody,
                        Metadata: { "x-apnagit-symlink": "true", "x-target": item.target }
                    }));
                } else {
                    const content = await fs.readFile(itemLocalPath);
                    await s3Client.send(new PutObjectCommand({
                        Bucket: bucketName,
                        Key: s3Key,
                        Body: content
                    }));
                }
                uploadedFiles++;
            }
        }

        // Step 3: Concurrency-safe atomic remote HEAD update
        const newHeadPayload = JSON.stringify({
            currentCommit: localHeadCommit,
            updatedAt: new Date().toISOString()
        }, null, 2);

        const putHeadParams = {
            Bucket: bucketName,
            Key: headKey,
            Body: newHeadPayload
        };

        if (remoteHeadEtag) {
            putHeadParams.IfMatch = remoteHeadEtag;
        } else if (!remoteHeadData) {
            putHeadParams.IfNoneMatch = "*";
        }

        try {
            await s3Client.send(new PutObjectCommand(putHeadParams));
        } catch (headPutErr) {
            if (headPutErr.name === "PreconditionFailed" || headPutErr.$metadata?.httpStatusCode === 412) {
                console.error("\n[Push Concurrency Conflict] Remote HEAD was modified by another push while your upload was in progress.");
                console.error("Your commit objects were uploaded, but remote HEAD was not updated to prevent overwriting newer state.");
                console.error("Please pull and merge before pushing again.");
                return;
            }
            throw headPutErr;
        }

        console.log("\n----------------------------------------");
        console.log("Repository successfully pushed to S3!");
        console.log(`Repository ID: ${repositoryId}`);
        console.log(`Current HEAD: ${localHeadCommit}`);
        console.log(`Total objects uploaded: ${uploadedFiles + 1}`);
        console.log(`S3 Bucket: ${bucketName}`);
        console.log("----------------------------------------");
    } catch (error) {
        console.error("\nFailed to push repository to S3.");
        console.error("Error:", error.message);
    }
}

export default PushFile;