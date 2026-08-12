import fs from "fs/promises";
import path from "path";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

async function PullFile() {
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

    // Validate S3 client
    if (!s3Client) {
        console.error(
            "AWS S3 Client could not be initialized. Check config/aws-config.js."
        );
        return;
    }

    // Validate bucket name
    if (!bucketName) {
        console.error(
            "S3 bucket name is missing in config/aws-config.js."
        );
        return;
    }

    // Local repository path
    const repoPath = path.resolve(process.cwd(), ".apnaGit");

    // Commits directory
    const commitsPath = path.join(repoPath, "commits");

    // Check whether repository exists
    try {
        await fs.access(repoPath);
    } catch {
        console.error(
            'Repository not initialized. Run "node index.js init" first.'
        );
        return;
    }

    try {
        console.log(
            `\nDownloading repository history from S3 bucket "${bucketName}"...`
        );

        // Create commits directory if it doesn't exist
        await fs.mkdir(commitsPath, { recursive: true });

        // List all objects inside commits/
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: "commits/",
        });

        const response = await s3Client.send(listCommand);

        const objects = response.Contents || [];

        if (objects.length === 0) {
            console.log("No commits found in the remote repository.");
        } else {
            let downloadedFiles = 0;

            // Download every commit file
            for (const object of objects) {
                const s3Key = object.Key;

                // Ignore empty folder keys
                if (!s3Key || s3Key.endsWith("/")) {
                    continue;
                }

                console.log(`Downloading: ${s3Key}`);

                const getCommand = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: s3Key,
                });

                const fileResponse = await s3Client.send(getCommand);

                // Remove "commits/" from the beginning
                const relativePath = s3Key.replace(/^commits\//, "");

                // Local file path
                const localFilePath = path.join(
                    commitsPath,
                    relativePath
                );

                // Create required directories
                await fs.mkdir(path.dirname(localFilePath), {
                    recursive: true,
                });

                // Convert S3 response body to Buffer
                const fileContent = await fileResponse.Body.transformToByteArray();

                // Write file locally
                await fs.writeFile(
                    localFilePath,
                    Buffer.from(fileContent)
                );

                downloadedFiles++;

                console.log(`Downloaded successfully: ${relativePath}`);
            }

            console.log(
                `\nTotal commit files downloaded: ${downloadedFiles}`
            );
        }

        // Download head.json
        try {
            console.log("\nDownloading repository metadata...");

            const headCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: "repo-state/head.json",
            });

            const headResponse = await s3Client.send(headCommand);

            const headContent =
                await headResponse.Body.transformToString();

            await fs.writeFile(
                path.join(repoPath, "head.json"),
                headContent
            );

            console.log("head.json downloaded successfully.");
        } catch (error) {
            if (error.name === "NoSuchKey") {
                console.log(
                    "No remote head.json found. Skipping metadata download."
                );
            } else {
                throw error;
            }
        }

        console.log("\n----------------------------------------");
        console.log("Repository successfully pulled from S3!");
        console.log(`S3 Bucket: ${bucketName}`);
        console.log("----------------------------------------");

    } catch (error) {
        console.error("\nFailed to pull repository from S3.");
        console.error("Error:", error.message);

        // AWS credentials error
        if (
            error.name === "CredentialsProviderError" ||
            error.name === "CredentialProviderError"
        ) {
            console.error(
                "\nAWS credentials were not found. Configure them using:"
            );
            console.error("aws configure");
        }

        // Bucket doesn't exist
        if (error.name === "NoSuchBucket") {
            console.error(
                `\nThe S3 bucket "${bucketName}" does not exist.`
            );
        }

        // Access denied
        if (error.name === "AccessDenied") {
            console.error(
                "\nAccess denied. Check your AWS IAM permissions."
            );
        }
    }
}

export default PullFile;