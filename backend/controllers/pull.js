import fs from "fs/promises";
import path from "path";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { sanitizeRepoId, validatePathSafety } from "../utils/pathSecurity.js";
import { copyDirectoryRecursive } from "../utils/snapshotEngine.js";

async function PullFile(argv = {}) {
    console.log("Fetching remote repository history...");

    let s3Client;
    let bucketName;

    // Load AWS configuration
    try {
        const config = await import("../config/aws-config.js");
        s3Client = config.getS3Client ? config.getS3Client() : config.s3Client;
        bucketName = config.getBucketName ? config.getBucketName() : config.S3_BUCKET;
    } catch (error) {
        console.error("\n[Error] Could not load AWS configuration.");
        console.error(error.message);
        return { success: false, error: error.message };
    }

    if (!s3Client) {
        const msg = "AWS S3 Client could not be initialized. Check config/aws-config.js.";
        console.error(msg);
        return { success: false, error: msg };
    }

    if (!bucketName) {
        const msg = "S3 bucket name is missing. Please set S3_BUCKET_NAME in your environment.";
        console.error(msg);
        return { success: false, error: msg };
    }

    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");
    const headPath = path.join(repoPath, "head.json");
    const configPath = path.join(repoPath, "config.json");
    const tmpPullPath = path.join(repoPath, `tmp-pull-${Date.now()}`);

    try {
        await fs.access(repoPath);
    } catch {
        const msg = 'Repository not initialized. Run "node index.js init" first.';
        console.error(msg);
        return { success: false, error: msg };
    }

    // Resolve repository ID safely
    let repositoryId;
    try {
        const configRaw = await fs.readFile(configPath, "utf-8");
        repositoryId = JSON.parse(configRaw).repositoryId;
    } catch {
        repositoryId = argv.repoId || (argv._ && argv._[1]) || process.env.APNAGIT_REPO_ID;
        if (repositoryId) {
            try {
                const sanitized = sanitizeRepoId(repositoryId);
                await fs.writeFile(configPath, JSON.stringify({ repositoryId: sanitized, version: 2 }, null, 2));
                console.log(`[Config] Automatically saved repository ID "${sanitized}" to .apnaGit/config.json`);
            } catch {}
        }
    }

    if (!repositoryId) {
        const msg = "Repository ID is not configured. Run 'node index.js init <repoId>' or specify '--repoId <id>'.";
        console.error(msg);
        return { success: false, error: msg };
    }

    try {
        repositoryId = sanitizeRepoId(repositoryId);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return { success: false, error: err.message };
    }

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
            return { success: true, message: "No commits found in the remote repository.", downloadedFiles: 0 };
        }

        // Transactional Staging for Failure Recovery: download into tmpPullPath first
        await fs.mkdir(tmpPullPath, { recursive: true });
        let downloadedFiles = 0;
        const commitFolders = new Set();

        try {
            for (const object of allObjects) {
                const s3Key = object.Key;
                if (!s3Key || s3Key.endsWith("/")) continue;

                const relativeToCommits = s3Key.slice(commitsPrefix.length);

                // Security: Validate path safety against directory traversal attempts
                let safeRel;
                try {
                    safeRel = validatePathSafety(relativeToCommits, commitsPath);
                } catch (secErr) {
                    throw new Error(`Security Violation: Remote S3 object key "${s3Key}" failed path safety check: ${secErr.message}`);
                }

                const commitId = safeRel.split("/")[0];
                if (commitId) {
                    commitFolders.add(commitId);
                }

                const stagedFilePath = path.join(tmpPullPath, safeRel);
                await fs.mkdir(path.dirname(stagedFilePath), { recursive: true });

                const getCommand = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: s3Key,
                });
                const fileResponse = await s3Client.send(getCommand);

                // Check for symlink metadata
                const isSymlink = fileResponse.Metadata?.["x-apnagit-symlink"] === "true";
                const symlinkTarget = fileResponse.Metadata?.["x-target"];

                if (isSymlink && symlinkTarget) {
                    // Security: Verify symlink target does not escape repository boundary
                    const sanitizedTarget = symlinkTarget.replace(/\\/g, "/");
                    if (sanitizedTarget.startsWith("/") || /^[a-zA-Z]:/.test(sanitizedTarget) || sanitizedTarget.split("/").includes("..")) {
                        console.warn(`[Security Warning] Skipping unsafe remote symlink target "${symlinkTarget}".`);
                        await fs.writeFile(stagedFilePath, `[unsafe-symlink:${symlinkTarget}]`);
                    } else {
                        try {
                            try { await fs.unlink(stagedFilePath); } catch {}
                            await fs.symlink(sanitizedTarget, stagedFilePath);
                        } catch (symlinkErr) {
                            // On Windows without elevated/developer permissions, write a link pointer
                            await fs.writeFile(stagedFilePath, `symlink:${sanitizedTarget}`);
                        }
                    }
                } else {
                    const fileContent = await fileResponse.Body.transformToByteArray();
                    await fs.writeFile(stagedFilePath, Buffer.from(fileContent));
                }

                downloadedFiles++;
            }

            // Step 2: Integrity Verification across all staged commit snapshots
            for (const cId of commitFolders) {
                const cStagedDir = path.join(tmpPullPath, cId);
                const metaFile = path.join(cStagedDir, "commit-metadata.json");
                try {
                    const metaRaw = await fs.readFile(metaFile, "utf-8");
                    const meta = JSON.parse(metaRaw);
                    if (!meta.id) {
                        throw new Error(`Missing commit id in metadata for "${cId}".`);
                    }
                } catch (metaErr) {
                    console.warn(`[Integrity Warning] Commit "${cId}" metadata verification issue: ${metaErr.message}`);
                }
            }

            // Move verified commits into local commitsPath
            for (const cId of commitFolders) {
                const srcDir = path.join(tmpPullPath, cId);
                const destDir = path.join(commitsPath, cId);
                await fs.mkdir(destDir, { recursive: true });
                await copyDirectoryRecursive(srcDir, destDir, false);
            }

            console.log(`\nTotal commit objects downloaded and verified: ${downloadedFiles}`);
        } finally {
            // Clean up temporary download staging
            try {
                await fs.rm(tmpPullPath, { recursive: true, force: true });
            } catch {}
        }

        // Step 3: Download remote HEAD safely
        let remoteHeadCommitId = null;
        try {
            console.log("Downloading repository metadata...");
            const headCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: headKey,
            });

            const headResponse = await s3Client.send(headCommand);
            const headContent = await headResponse.Body.transformToString();
            const parsedRemoteHead = JSON.parse(headContent);
            remoteHeadCommitId = parsedRemoteHead.currentCommit;

            if (remoteHeadCommitId) {
                // Validate that the referenced commit exists locally
                const commitDir = path.join(commitsPath, remoteHeadCommitId);
                try {
                    await fs.access(commitDir);
                    await fs.writeFile(headPath, JSON.stringify({ currentCommit: remoteHeadCommitId }, null, 2));
                    console.log(`head.json updated to remote commit: ${remoteHeadCommitId}`);
                } catch {
                    console.warn(`Warning: Remote HEAD points to "${remoteHeadCommitId}", but commit folder was not found locally. Local HEAD was not updated.`);
                }
            }
        } catch (error) {
            if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
                console.log("No remote head.json found. Skipping metadata download.");
            } else {
                throw error;
            }
        }

        // Step 4: Optional automatic working directory checkout if requested
        if (argv.checkout && remoteHeadCommitId) {
            try {
                const revertModule = await import("./revert.js");
                const RevertFile = revertModule.default || revertModule;
                console.log(`\nSynchronizing working tree with pulled commit ${remoteHeadCommitId}...`);
                await RevertFile({ commitId: remoteHeadCommitId });
            } catch (revErr) {
                console.warn(`[Checkout Warning] Could not automatically update working tree: ${revErr.message}`);
            }
        }

        console.log("\n----------------------------------------");
        console.log("Repository successfully pulled from S3!");
        console.log(`Repository ID: ${repositoryId}`);
        console.log(`Remote HEAD: ${remoteHeadCommitId || "None"}`);
        console.log(`S3 Bucket: ${bucketName}`);
        console.log("----------------------------------------");

        return {
            success: true,
            repositoryId,
            remoteHead: remoteHeadCommitId,
            downloadedFiles
        };
    } catch (error) {
        console.error("\nFailed to pull repository from S3.");
        console.error("Error:", error.message);
        return { success: false, error: error.message };
    }
}

export default PullFile;