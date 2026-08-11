import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: "ap-south-1",
});

const S3_BUCKET = "gitbucket0";

export { s3Client, S3_BUCKET };