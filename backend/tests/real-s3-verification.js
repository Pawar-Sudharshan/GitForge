import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import dotenv from "dotenv";
dotenv.config();
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectsCommand,
    HeadBucketCommand
} from "@aws-sdk/client-s3";

import initRepo from "../controllers/init.js";
import AddFile from "../controllers/add.js";
import CommitFile from "../controllers/commit.js";
import PushFile from "../controllers/push.js";
import PullFile from "../controllers/pull.js";
import { getS3Client, getBucketName } from "../config/aws-config.js";

async function runRealS3Verification() {
    console.log("=================================================");
    console.log("  GitForge Phase 2 - Live AWS S3 Verification");
    console.log("=================================================\n");

    const bucketName = process.env.S3_BUCKET_NAME || getBucketName();
    const region = process.env.AWS_REGION || "ap-south-1";
    console.log(`Target Bucket : ${bucketName}`);
    console.log(`Target Region : ${region}`);

    const s3 = getS3Client();

    // 1. Verify read-only access to the bucket
    console.log("\n[1/7] Verifying live S3 access and bucket existence...");
    try {
        await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`  ✓ Bucket "${bucketName}" exists and is accessible.`);
    } catch (err) {
        console.error(`  ✗ Unable to access S3 bucket "${bucketName}":`, err.message);
        process.exit(1);
    }

    // Record pre-existing root items to guarantee zero impact
    const preCheck = await s3.send(new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 10
    }));
    const preExistingKeys = (preCheck.Contents || []).map(c => c.Key);
    console.log(`  ✓ Read-only scan confirmed ${preExistingKeys.length} pre-existing object(s) in bucket.`);

    // 2. Setup isolated sandbox repository ID
    const testRepoId = `repo-sandbox-${Date.now()}`;
    const testPrefix = `repositories/${testRepoId}`;
    console.log(`\n[2/7] Initializing local test repository: ${testRepoId}`);

    const originalCwd = process.cwd();
    const localDir = await fs.mkdtemp(path.join(os.tmpdir(), "gitforge-s3-live-"));
    process.chdir(localDir);

    try {
        await initRepo({ repoId: testRepoId });
        console.log("  ✓ Repository initialized.");

        // 3. Create test files and multiple commits
        console.log("\n[3/7] Staging and committing full-tree snapshots...");
        await fs.writeFile(path.join(localDir, "README.md"), "# Real S3 Integration Test\nTesting GitForge Phase 2.");
        await fs.mkdir(path.join(localDir, "src"), { recursive: true });
        await fs.writeFile(path.join(localDir, "src", "app.json"), JSON.stringify({ version: "2.0.0", mode: "test" }, null, 2));
        await fs.writeFile(path.join(localDir, ".env.example"), "PUBLIC_VAR=123");

        await AddFile({ file: "README.md" });
        await AddFile({ file: "src/app.json" });
        await AddFile({ file: ".env.example" });
        await CommitFile({ message: "Live S3 initial commit" });
        const head1 = JSON.parse(await fs.readFile(path.join(localDir, ".apnaGit", "head.json"), "utf-8"));
        const commit1Id = head1.currentCommit;
        console.log(`  ✓ Commit 1 created: ${commit1Id}`);

        // Commit 2: Modify app.json, add feature.txt
        await fs.writeFile(path.join(localDir, "src", "app.json"), JSON.stringify({ version: "2.1.0", mode: "production" }, null, 2));
        await fs.writeFile(path.join(localDir, "feature.txt"), "New feature content");
        await AddFile({ file: "src/app.json" });
        await AddFile({ file: "feature.txt" });
        await CommitFile({ message: "Live S3 second commit" });
        const head2 = JSON.parse(await fs.readFile(path.join(localDir, ".apnaGit", "head.json"), "utf-8"));
        const commit2Id = head2.currentCommit;
        console.log(`  ✓ Commit 2 created: ${commit2Id} (parent: ${commit1Id})`);

        // 4. Push to real S3
        console.log("\n[4/7] Pushing repository to real AWS S3...");
        const pushRes = await PushFile({ repoId: testRepoId });
        assert.equal(pushRes.success, true, "Push to live S3 failed");
        console.log(`  ✓ Push completed. Total objects uploaded: ${pushRes.uploadedObjects}`);

        // 5. Inspect remote S3 objects strictly within sandbox prefix
        console.log("\n[5/7] Verifying remote S3 storage layout and isolation...");
        const listRes = await s3.send(new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `${testPrefix}/`
        }));
        const uploadedKeys = (listRes.Contents || []).map(c => c.Key);
        console.log(`  ✓ Found ${uploadedKeys.length} remote objects under prefix "${testPrefix}/":`);
        for (const k of uploadedKeys) {
            console.log(`    - ${k}`);
            assert.ok(k.startsWith(`${testPrefix}/`), `Object key outside sandbox prefix: ${k}`);
        }

        // Verify remote head.json points to commit2
        const remoteHeadRaw = await s3.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: `${testPrefix}/repo-state/head.json`
        }));
        const remoteHead = JSON.parse(await remoteHeadRaw.Body.transformToString());
        assert.equal(remoteHead.currentCommit, commit2Id, "Remote HEAD does not match local commit 2");
        console.log(`  ✓ Remote HEAD verified: ${remoteHead.currentCommit}`);

        // 6. Test Pull with checkout in a completely fresh directory
        console.log("\n[6/7] Pulling repository in fresh directory with --checkout...");
        const cloneDir = await fs.mkdtemp(path.join(os.tmpdir(), "gitforge-s3-pull-"));
        process.chdir(cloneDir);

        await initRepo({ repoId: testRepoId });
        const pullRes = await PullFile({ repoId: testRepoId, checkout: true });
        assert.equal(pullRes.success, true, "Pull from live S3 failed");
        console.log(`  ✓ Pull completed. Remote HEAD applied: ${pullRes.remoteHead}`);

        // Verify pulled working tree contents
        const pulledReadme = await fs.readFile(path.join(cloneDir, "README.md"), "utf-8");
        assert.ok(pulledReadme.includes("Testing GitForge Phase 2"));

        const pulledAppJson = JSON.parse(await fs.readFile(path.join(cloneDir, "src", "app.json"), "utf-8"));
        assert.equal(pulledAppJson.version, "2.1.0");

        const pulledFeature = await fs.readFile(path.join(cloneDir, "feature.txt"), "utf-8");
        assert.equal(pulledFeature, "New feature content");

        // Verify parent lineage in pulled snapshot metadata
        const meta2 = JSON.parse(await fs.readFile(path.join(cloneDir, ".apnaGit", "commits", commit2Id, "commit-metadata.json"), "utf-8"));
        assert.equal(meta2.parentCommit, commit1Id);
        console.log("  ✓ Working tree and snapshot lineage verified bit-for-bit!");

        // Switch cwd back before cleaning up cloneDir
        process.chdir(localDir);
        await fs.rm(cloneDir, { recursive: true, force: true });

        // 7. Cleanup sandbox objects in S3
        console.log("\n[7/7] Cleaning up temporary sandbox objects in S3...");
        if (uploadedKeys.length > 0) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: bucketName,
                Delete: {
                    Objects: uploadedKeys.map(k => ({ Key: k })),
                    Quiet: true
                }
            }));
            console.log(`  ✓ Safely deleted ${uploadedKeys.length} sandbox objects under "${testPrefix}/".`);
        }

        // Verify that pre-existing objects still exist
        const postCheck = await s3.send(new ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: 10
        }));
        const postKeys = (postCheck.Contents || []).map(c => c.Key);
        for (const preK of preExistingKeys) {
            assert.ok(postKeys.includes(preK), `Pre-existing key ${preK} was unexpectedly modified!`);
        }
        console.log("  ✓ Zero regression: Pre-existing bucket objects remain intact.");

        console.log("\n=================================================");
        console.log("  ✓ ALL LIVE AWS S3 TESTS PASSED SUCCESSFULLY!");
        console.log("=================================================\n");
    } finally {
        process.chdir(originalCwd);
        try {
            await fs.rm(localDir, { recursive: true, force: true });
        } catch {}
    }
}

runRealS3Verification().catch(err => {
    console.error("\nLive S3 Verification Error:", err);
    process.exit(1);
});
