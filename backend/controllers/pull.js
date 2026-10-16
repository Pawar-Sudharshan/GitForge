import fs from "fs/promises";
import path from "path";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { sanitizeRepoId } from "../utils/pathSecurity.js";

async function PullFile(argv = {}) {
    console.log("Fetching remote repository history...");

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
        console.error("Repository ID is not configured. Run 'node index.js init <repoId>' or specify '--repo <repoId>'.");
        return;
    }

    try {
        repositoryId = sanitizeRepoId(repositoryId);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return;
    }

    const s3Prefix = `repositories/${repositoryId}/`;
    const commitsPrefix = `repositories/${repositoryId}/commits/`;
    const headKey = `repositories/${repositoryId}/repo-state/head.json`;

    try {
        console.log(`\nDownloading repository "${repositoryId}" from S3 bucket "${bucketName}"...`);
        await fs.mkdir(commitsPath, { recursive: true });

        // Step 1: Paginated listing of all objects under repositories/<repoId>/commits/
        let continuationToken = undefined;
        let allObjects = [];
        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: commitsPrefix,
                ContinuationToken: continuationToken,
            });

            const listResponse = await s3Client.send(listCommand);
            const contents = listResponse.Contents || [];
            allObjects = allObjects.concat(contents);

            if (listResponse.IsTruncated && listResponse.NextContinuationToken) {
                continuationToken = listResponse.NextContinuationToken;
            } else {
                continuationToken = undefined;
            }
        } while (continuationToken);

        if (allObjects.length === 0) {
            console.log("No commits found in the remote repository.");
        } else {
            let downloadedFiles = 0;

            for (const object of allObjects) {
                const s3Key = object.Key;
                if (!s3Key || s3Key.endsWith("/")) continue;

                // Strip prefix
                const relativeToCommits = s3Key.slice(commitsPrefix.length);
                const localFilePath = path.join(commitsPath, relativeToCommits);

                await fs.mkdir(path.dirname(localFilePath), { recursive: true });

                const getCommand = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: s3Key,
                });
                const fileResponse = await s3Client.send(getCommand);

                // Check for symlink metadata
                const isSymlink = fileResponse.Metadata?.["x-apnagit-symlink"] === "true";
                const symlinkTarget = fileResponse.Metadata?.["x-target"];

                if (isSymlink && symlinkTarget) {
                    try { await fs.unlink(localFilePath); } catch {}
                    await fs.symlink(symlinkTarget, localFilePath);
                } else {
                    const fileContent = await fileResponse.Body.transformToByteArray();
                    await fs.writeFile(localFilePath, Buffer.from(fileContent));
                }

                downloadedFiles++;
                console.log(`Downloaded: ${relativeToCommits}`);
            }

            console.log(`\nTotal commit objects downloaded: ${downloadedFiles}`);
        }

        // Step 2: Download remote HEAD
        try {
            console.log("Downloading repository metadata...");
            const headCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: headKey,
            });

            const headResponse = await s3Client.send(headCommand);
            const headContent = await headResponse.Body.transformToString();
            const parsedRemoteHead = JSON.parse(headContent);

            if (parsedRemoteHead.currentCommit) {
                // Validate that the referenced commit exists locally
                const commitDir = path.join(commitsPath, parsedRemoteHead.currentCommit);
                try {
                    await fs.access(commitDir);
                    await fs.writeFile(headPath, JSON.stringify({ currentCommit: parsedRemoteHead.currentCommit }, null, 2));
                    console.log(`head.json updated to remote commit: ${parsedRemoteHead.currentCommit}`);
                } catch {
                    console.warn(`Warning: Remote HEAD points to "${parsedRemoteHead.currentCommit}", but commit folder was not found locally. Local HEAD was not updated.`);
                }
            }
        } catch (error) {
            if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
                console.log("No remote head.json found. Skipping metadata download.");
            } else {
                throw error;
            }
        }

        console.log("\n----------------------------------------");
        console.log("Repository successfully pulled from S3!");
        console.log(`Repository ID: ${repositoryId}`);
        console.log(`S3 Bucket: ${bucketName}`);
        console.log("----------------------------------------");
    } catch (error) {
        console.error("\nFailed to pull repository from S3.");
        console.error("Error:", error.message);
    }
}

export default PullFile;