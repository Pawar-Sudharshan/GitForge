import fs from "fs/promises";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

async function PushFile() {
    console.log("Preparing to push local repository history to remote...");

    let s3Client;
    let bucketName;

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
        console.error(
            "AWS S3 Client could not be initialized. Check config/aws-config.js."
        );
        return;
    }

    if (!bucketName) {
        console.error(
            "S3 bucket name is missing in config/aws-config.js."
        );
        return;
    }

    const repoPath = path.resolve(process.cwd(), ".apnaGit");

    // Check whether repository exists
    try {
        await fs.access(repoPath);
    } catch {
        console.error(
            'Repository not initialized. Run "node index.js init" first.'
        );
        return;
    }

    // Read head.json
    const headPath = path.join(repoPath, "head.json");

    let headContent;

    try {
        headContent = await fs.readFile(headPath, "utf-8");
    } catch {
        console.error(
            "head.json not found inside .apnaGit."
        );
        return;
    }

    try {
        console.log(
            `Uploading repository metadata to S3 bucket "${bucketName}"...`
        );

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: "repo-state/head.json",
            Body: headContent,
            ContentType: "application/json",
        });

        await s3Client.send(command);

        console.log("Repository state successfully pushed to S3!");
        console.log(
            `Uploaded: s3://${bucketName}/repo-state/head.json`
        );
    } catch (error) {
        console.error("\nFailed to push to S3.");
        console.error("Error:", error.message);

        if (error.name === "CredentialsProviderError") {
            console.error(
                "\nAWS credentials were not found. Configure them using:"
            );
            console.error("aws configure");
        }

        if (error.name === "NoSuchBucket") {
            console.error(
                `\nThe S3 bucket "${bucketName}" does not exist.`
            );
        }
    }
}

export default PushFile;