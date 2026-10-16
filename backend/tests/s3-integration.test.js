import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

import PushFile from '../controllers/push.js';
import PullFile from '../controllers/pull.js';
import initRepo from '../controllers/init.js';
import AddFile from '../controllers/add.js';
import CommitFile from '../controllers/commit.js';
import { setS3Client } from '../config/aws-config.js';

/**
 * In-Memory Mock S3 Client implementing AWS SDK v3 Commands
 */
class MockS3Client {
    constructor() {
        this.store = new Map(); // key -> { body: Buffer, metadata: object, etag: string }
        this.networkFailOnKey = null;
        this.maxKeysPerPage = 1000;
    }

    async send(command) {
        const cmdName = command.constructor.name;
        const input = command.input || {};

        if (this.networkFailOnKey && input.Key && input.Key.includes(this.networkFailOnKey)) {
            const err = new Error("Mock S3 Network Failure: Connection reset by peer");
            err.name = "NetworkingError";
            throw err;
        }

        if (cmdName === "PutObjectCommand") {
            const key = input.Key;
            const existing = this.store.get(key);

            // Simulate concurrent write if raceConditionOnKey matches
            if (this.raceConditionOnKey && key.includes(this.raceConditionOnKey) && existing) {
                existing.etag = '"concurrent-intervening-etag-' + Date.now() + '"';
                this.raceConditionOnKey = null; // trigger once
            }

            // Conditional write check: IfMatch
            if (input.IfMatch) {
                if (!existing || existing.etag !== input.IfMatch) {
                    const err = new Error("Precondition Failed");
                    err.name = "PreconditionFailed";
                    err.$metadata = { httpStatusCode: 412 };
                    throw err;
                }
            }

            // Conditional write check: IfNoneMatch
            if (input.IfNoneMatch === "*") {
                if (existing) {
                    const err = new Error("Precondition Failed: Resource already exists");
                    err.name = "PreconditionFailed";
                    err.$metadata = { httpStatusCode: 412 };
                    throw err;
                }
            }

            let buf;
            if (Buffer.isBuffer(input.Body)) {
                buf = input.Body;
            } else if (typeof input.Body === "string") {
                buf = Buffer.from(input.Body, "utf-8");
            } else if (input.Body && typeof input.Body.transformToByteArray === "function") {
                buf = Buffer.from(await input.Body.transformToByteArray());
            } else {
                buf = Buffer.from(input.Body || "");
            }

            const etag = `"${crypto.createHash("md5").update(buf).digest("hex")}"`;
            this.store.set(key, {
                body: buf,
                metadata: input.Metadata || {},
                etag
            });

            return { ETag: etag };
        }

        if (cmdName === "GetObjectCommand") {
            const key = input.Key;
            const item = this.store.get(key);
            if (!item) {
                const err = new Error(`NoSuchKey: The specified key does not exist. Key: ${key}`);
                err.name = "NoSuchKey";
                err.$metadata = { httpStatusCode: 404 };
                throw err;
            }

            return {
                Body: {
                    transformToString: async () => item.body.toString("utf-8"),
                    transformToByteArray: async () => new Uint8Array(item.body)
                },
                Metadata: item.metadata,
                ETag: item.etag
            };
        }

        if (cmdName === "ListObjectsV2Command") {
            const prefix = input.Prefix || "";
            const matchedKeys = Array.from(this.store.keys())
                .filter(k => k.startsWith(prefix))
                .sort();

            let startIndex = 0;
            if (input.ContinuationToken) {
                const tokenIndex = matchedKeys.indexOf(input.ContinuationToken);
                if (tokenIndex !== -1) {
                    startIndex = tokenIndex;
                }
            }

            const limit = Math.min(input.MaxKeys || 1000, this.maxKeysPerPage);
            const pageKeys = matchedKeys.slice(startIndex, startIndex + limit);
            const isTruncated = (startIndex + limit) < matchedKeys.length;
            const nextContinuationToken = isTruncated ? matchedKeys[startIndex + limit] : undefined;

            return {
                Contents: pageKeys.map(k => ({
                    Key: k,
                    Size: this.store.get(k).body.length,
                    ETag: this.store.get(k).etag
                })),
                IsTruncated: isTruncated,
                NextContinuationToken: nextContinuationToken
            };
        }

        throw new Error(`Unsupported MockS3 Command: ${cmdName}`);
    }
}

describe('Phase 2 AWS S3 Remote Synchronization Subsystem', () => {
    let tempDir;
    let originalCwd;
    let mockS3;

    beforeEach(async () => {
        originalCwd = process.cwd();
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gitforge-s3-test-'));
        process.chdir(tempDir);

        mockS3 = new MockS3Client();
        setS3Client(mockS3);
        process.env.S3_BUCKET_NAME = "gitbucket0";
        process.env.AWS_REGION = "ap-south-1";
    });

    afterEach(async () => {
        process.chdir(originalCwd);
        setS3Client(null);
        if (tempDir) {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch {}
        }
    });

    test('1. Repository Isolation: distinct prefixes prevent cross-repo overwrites', async () => {
        // Init Repo A
        await initRepo({ repoId: 'repo-alpha' });
        await fs.writeFile(path.join(tempDir, 'fileA.txt'), 'hello from alpha');
        await AddFile({ file: 'fileA.txt' });
        await CommitFile({ message: 'Alpha commit' });

        const pushResA = await PushFile({ repoId: 'repo-alpha' });
        assert.equal(pushResA.success, true);

        // Verify keys in S3 are strictly prefixed with repositories/repo-alpha/
        const keysA = Array.from(mockS3.store.keys());
        assert.ok(keysA.every(k => k.startsWith('repositories/repo-alpha/')));
        assert.ok(keysA.some(k => k.endsWith('head.json')));

        // Now setup Repo B in a new directory
        const tempDirB = await fs.mkdtemp(path.join(os.tmpdir(), 'gitforge-s3-test-b-'));
        process.chdir(tempDirB);

        await initRepo({ repoId: 'repo-beta' });
        await fs.writeFile(path.join(tempDirB, 'fileB.txt'), 'hello from beta');
        await AddFile({ file: 'fileB.txt' });
        await CommitFile({ message: 'Beta commit' });

        const pushResB = await PushFile({ repoId: 'repo-beta' });
        assert.equal(pushResB.success, true);

        const allKeys = Array.from(mockS3.store.keys());
        assert.ok(allKeys.some(k => k.startsWith('repositories/repo-alpha/')));
        assert.ok(allKeys.some(k => k.startsWith('repositories/repo-beta/')));

        // Clean up tempDirB
        process.chdir(tempDir);
        await fs.rm(tempDirB, { recursive: true, force: true });
    });

    test('2. Push Ancestry & Fast-Forward Validation', async () => {
        await initRepo({ repoId: 'repo-ancestry' });

        // Commit 1
        await fs.writeFile(path.join(tempDir, 'f1.txt'), 'version 1');
        await AddFile({ file: 'f1.txt' });
        await CommitFile({ message: 'Commit 1' });

        // First push creates remote HEAD
        const res1 = await PushFile();
        assert.equal(res1.success, true);

        // Pushing again without changes returns up-to-date
        const resUpToDate = await PushFile();
        assert.equal(resUpToDate.success, true);
        assert.equal(resUpToDate.upToDate, true);

        // Commit 2 (child of Commit 1)
        await fs.writeFile(path.join(tempDir, 'f2.txt'), 'version 2');
        await AddFile({ file: 'f2.txt' });
        await CommitFile({ message: 'Commit 2' });

        // Push should fast-forward remote HEAD
        const res2 = await PushFile();
        assert.equal(res2.success, true);

        const remoteHeadRaw = await mockS3.send(new (await import('@aws-sdk/client-s3')).GetObjectCommand({
            Bucket: 'gitbucket0',
            Key: 'repositories/repo-ancestry/repo-state/head.json'
        }));
        const remoteHead = JSON.parse(await remoteHeadRaw.Body.transformToString());
        assert.equal(remoteHead.currentCommit, res2.currentCommit);
    });

    test('3. Divergence Detection & Push Conflict Protection', async () => {
        await initRepo({ repoId: 'repo-diverge' });

        await fs.writeFile(path.join(tempDir, 'f1.txt'), 'initial');
        await AddFile({ file: 'f1.txt' });
        await CommitFile({ message: 'Root' });
        await PushFile();

        // Simulate someone else pushing a diverged commit to remote HEAD
        const divergedCommitId = 'commit-remote-different-999';
        await mockS3.store.set('repositories/repo-diverge/repo-state/head.json', {
            body: Buffer.from(JSON.stringify({ currentCommit: divergedCommitId })),
            metadata: {},
            etag: '"different-etag"'
        });

        // Now local creates a new commit
        await fs.writeFile(path.join(tempDir, 'f2.txt'), 'local change');
        await AddFile({ file: 'f2.txt' });
        await CommitFile({ message: 'Local diverged' });

        // Push without --force must fail with conflict
        const resConflict = await PushFile();
        assert.equal(resConflict.success, false);
        assert.equal(resConflict.conflict, true);
        assert.equal(resConflict.remoteHead, divergedCommitId);

        // Push with --force should succeed
        const resForce = await PushFile({ force: true });
        assert.equal(resForce.success, true);
    });

    test('4. Concurrency Protection with IfMatch (HTTP 412 handling)', async () => {
        await initRepo({ repoId: 'repo-concurrent' });
        await fs.writeFile(path.join(tempDir, 'file.txt'), 'v1');
        await AddFile({ file: 'file.txt' });
        await CommitFile({ message: 'C1' });
        await PushFile();

        // Local makes C2
        await fs.writeFile(path.join(tempDir, 'file.txt'), 'v2');
        await AddFile({ file: 'file.txt' });
        await CommitFile({ message: 'C2' });

        // Simulate concurrent modification right as push attempts to update head.json
        mockS3.raceConditionOnKey = 'head.json';

        const resConcurrent = await PushFile();
        assert.equal(resConcurrent.success, false);
        assert.equal(resConcurrent.concurrencyConflict, true);
    });

    test('5. S3 Pagination Handling across multiple pages', async () => {
        await initRepo({ repoId: 'repo-paged' });
        await fs.writeFile(path.join(tempDir, 'doc1.txt'), 'doc 1');
        await fs.writeFile(path.join(tempDir, 'doc2.txt'), 'doc 2');
        await fs.writeFile(path.join(tempDir, 'doc3.txt'), 'doc 3');
        await AddFile({ file: 'doc1.txt' });
        await AddFile({ file: 'doc2.txt' });
        await AddFile({ file: 'doc3.txt' });
        await CommitFile({ message: 'Paged files commit' });
        await PushFile();

        // Restrict mock S3 client to 1 object per page
        mockS3.maxKeysPerPage = 1;

        // In a new directory, pull this repository
        const cloneDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gitforge-pull-paged-'));
        process.chdir(cloneDir);
        await initRepo({ repoId: 'repo-paged' });

        const pullRes = await PullFile({ repoId: 'repo-paged' });
        assert.equal(pullRes.success, true);
        assert.ok(pullRes.downloadedFiles >= 4); // metadata + 3 files

        // Clean up cloneDir
        process.chdir(tempDir);
        await fs.rm(cloneDir, { recursive: true, force: true });
    });

    test('6. Security: Rejection of Path Traversal Keys during Pull', async () => {
        await initRepo({ repoId: 'repo-traversal-test' });

        // Inject malicious S3 object into mock S3 store
        mockS3.store.set('repositories/repo-traversal-test/commits/c1/../../escaped.txt', {
            body: Buffer.from('malicious payload'),
            metadata: {},
            etag: '"bad-key"'
        });

        const pullRes = await PullFile({ repoId: 'repo-traversal-test' });
        assert.equal(pullRes.success, false);
        assert.match(pullRes.error, /Security Violation/);

        // Verify that escaped.txt was never written outside
        const outsideExists = await fs.access(path.join(tempDir, '..', 'escaped.txt')).then(() => true).catch(() => false);
        assert.equal(outsideExists, false);
    });

    test('7. Security: Defense-in-Depth Secret Exclusion during Push', async () => {
        await initRepo({ repoId: 'repo-secret-test' });

        // Create a template (permitted) and secret file
        await fs.writeFile(path.join(tempDir, '.env.example'), 'TEMPLATE=1');
        await AddFile({ file: '.env.example' });

        // Manually place a secret file inside the staging directory to simulate bypass
        const stagingPath = path.join(tempDir, '.apnaGit', 'staging');
        await fs.writeFile(path.join(stagingPath, '.env'), 'SECRET_TOKEN=xyz');
        const indexPath = path.join(tempDir, '.apnaGit', 'index.json');
        await fs.writeFile(indexPath, JSON.stringify([
            { path: '.env.example', action: 'add' },
            { path: '.env', action: 'add' }
        ]));

        await CommitFile({ message: 'Commit with bypassed file' });
        const pushRes = await PushFile();
        assert.equal(pushRes.success, true);

        // S3 must contain .env.example but MUST NOT contain .env!
        const allKeys = Array.from(mockS3.store.keys());
        assert.ok(allKeys.some(k => k.includes('.env.example')));
        assert.ok(!allKeys.some(k => k.endsWith('/.env')));
    });

    test('8. Failure Recovery: Transactional Staging prevents corrupted partial commits on Pull', async () => {
        await initRepo({ repoId: 'repo-failure-test' });
        await fs.writeFile(path.join(tempDir, 'good.txt'), 'good content');
        await fs.writeFile(path.join(tempDir, 'trigger-fail.txt'), 'fail content');
        await AddFile({ file: 'good.txt' });
        await AddFile({ file: 'trigger-fail.txt' });
        await CommitFile({ message: 'Fail test commit' });
        await PushFile();

        // In a new directory, pull with network failure simulated on 'trigger-fail.txt'
        const cloneDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gitforge-pull-fail-'));
        process.chdir(cloneDir);
        await initRepo({ repoId: 'repo-failure-test' });

        mockS3.networkFailOnKey = "trigger-fail.txt";

        const pullRes = await PullFile({ repoId: 'repo-failure-test' });
        assert.equal(pullRes.success, false);

        // Verify that .apnaGit/commits has NOT incorporated the broken commit
        const localCommits = await fs.readdir(path.join(cloneDir, '.apnaGit', 'commits'));
        assert.equal(localCommits.length, 0);

        // Verify that tmp-pull directories were cleaned up
        const apnaGitFiles = await fs.readdir(path.join(cloneDir, '.apnaGit'));
        assert.ok(!apnaGitFiles.some(f => f.startsWith('tmp-pull')));

        process.chdir(tempDir);
        await fs.rm(cloneDir, { recursive: true, force: true });
    });
});
