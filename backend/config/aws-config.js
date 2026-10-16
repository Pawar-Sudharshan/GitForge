import { S3Client } from "@aws-sdk/client-s3";

let customClient = null;

function getS3Client() {
    if (customClient) return customClient;
    return new S3Client({
        region: process.env.AWS_REGION || "ap-south-1",
    });
}

function setS3Client(client) {
    customClient = client;
}

function getBucketName() {
    return process.env.S3_BUCKET_NAME || process.env.APNAGIT_S3_BUCKET || null;
}

// Backward-compatible exports
const s3Client = {
    send: (cmd) => getS3Client().send(cmd),
};

const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.APNAGIT_S3_BUCKET || null;

export { s3Client, S3_BUCKET, getS3Client, setS3Client, getBucketName };
