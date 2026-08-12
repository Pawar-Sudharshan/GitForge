import fs from "fs/promises";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

async function PushFile() {
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

    // Check whether commits directory exists
    try {
        await fs.access(commitsPath);
    } catch {
        console.error(
            "Commits directory not found inside .apnaGit."
        );
        return;
    }

    try {
        console.log(
            `\nUploading repository commits to S3 bucket "${bucketName}"...`
        );

        // Get all commit directories
        const commitDirs = await fs.readdir(commitsPath, {
            withFileTypes: true,
        });

        // Only process directories
        const directories = commitDirs.filter((entry) =>
            entry.isDirectory()
        );

        if (directories.length === 0) {
            console.log("No commits found to push.");
            return;
        }

        let uploadedFiles = 0;

        // Loop through every commit directory
        for (const commitDir of directories) {
            const commitName = commitDir.name;
            const commitPath = path.join(commitsPath, commitName);

            console.log(`\nProcessing commit: ${commitName}`);

            // Get files inside the commit directory
            const files = await fs.readdir(commitPath, {
                withFileTypes: true,
            });

            // Upload every file
            for (const file of files) {
                // Ignore nested directories
                if (!file.isFile()) {
                    continue;
                }

                const fileName = file.name;
                const filePath = path.join(commitPath, fileName);

                // Read file content
                const fileContent = await fs.readFile(filePath);

                // S3 key:
                // commits/<commitDir>/<fileName>
                const s3Key = `commits/${commitName}/${fileName}`;

                console.log(`Uploading: ${s3Key}`);

                const command = new PutObjectCommand({
                    Bucket: bucketName,
                    Key: s3Key,
                    Body: fileContent,
                });

                await s3Client.send(command);

                uploadedFiles++;

                console.log(`Uploaded successfully: ${s3Key}`);
            }
        }

        console.log("\n----------------------------------------");
        console.log("Repository successfully pushed to S3!");
        console.log(`Total files uploaded: ${uploadedFiles}`);
        console.log(`S3 Bucket: ${bucketName}`);
        console.log("----------------------------------------");

    } catch (error) {
        console.error("\nFailed to push repository to S3.");
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

export default PushFile;