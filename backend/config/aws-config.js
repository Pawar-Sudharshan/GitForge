import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
});

const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.APNAGIT_S3_BUCKET || null;

export { s3Client, S3_BUCKET };