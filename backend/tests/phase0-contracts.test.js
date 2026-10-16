import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';

import {
    getStorageRoot,
    sanitizeRepoId,
    validateCommitId,
    resolveRepoPath,
    getS3Keys,
    validateCommitMetadata,
    buildTreeDTO,
    validateBlobDTO,
    validateRepositoryDTO,
    validateIssueDTO
} from '../contracts/contracts.js';

describe('Phase 0: Architecture Contracts & Schema Specifications', () => {

    describe('1. Storage Root & Repository Boundary Containment', () => {
        test('Default storage root resolves to <cwd>/storage/repositories', () => {
            const root = getStorageRoot('');
            const expected = path.resolve(process.cwd(), 'storage', 'repositories');
            assert.equal(root, expected);
        });

        test('Custom REPOSITORIES_ROOT_DIR override is respected', () => {
            const customPath = path.join(os.tmpdir(), 'gitforge-custom-repos');
            const root = getStorageRoot(customPath);
            assert.equal(root, path.resolve(customPath));
        });

        test('sanitizeRepoId accepts valid alphanumeric, dashes, and underscores', () => {
            assert.equal(sanitizeRepoId('repo-123'), 'repo-123');
            assert.equal(sanitizeRepoId('my_project_v2'), 'my_project_v2');
            assert.equal(sanitizeRepoId('core-engine'), 'core-engine');
        });

        test('sanitizeRepoId rejects traversal, slashes, and invalid characters', () => {
            assert.throws(() => sanitizeRepoId('../escaped'), /Invalid repository ID/);
            assert.throws(() => sanitizeRepoId('..\\escaped'), /Invalid repository ID/);
            assert.throws(() => sanitizeRepoId('/root/dir'), /Invalid repository ID/);
            assert.throws(() => sanitizeRepoId('ab'), /Invalid repository ID/); // too short (<3)
            assert.throws(() => sanitizeRepoId(''), /non-empty string/);
            assert.throws(() => sanitizeRepoId('repo with spaces'), /Invalid repository ID/);
            assert.throws(() => sanitizeRepoId('repo$!@#'), /Invalid repository ID/);
        });

        test('resolveRepoPath constructs path within storage root and blocks escape attempts', () => {
            const customRoot = path.join(os.tmpdir(), 'sandbox-repos');
            const repoPath = resolveRepoPath('repo-core', customRoot);
            assert.equal(repoPath, path.resolve(customRoot, 'repo-core'));

            // Attempt traversal via sanitizeRepoId failure
            assert.throws(() => resolveRepoPath('../../etc', customRoot));
        });
    });

    describe('2. Phase 2 AWS S3 Remote Key Hierarchy Preservation', () => {
        test('getS3Keys preserves exact Phase 2 remote HEAD key', () => {
            const keys = getS3Keys('repo-alpha');
            // Strict Phase 2 invariant: repositories/<repoId>/repo-state/head.json
            assert.equal(keys.headKey, 'repositories/repo-alpha/repo-state/head.json');
        });

        test('getS3Keys preserves commit metadata and object key paths', () => {
            const keys = getS3Keys('repo-alpha');
            assert.equal(keys.prefix, 'repositories/repo-alpha');
            assert.equal(keys.commitsPrefix, 'repositories/repo-alpha/commits/');
            assert.equal(keys.configKey, 'repositories/repo-alpha/config.json');

            const commitId = 'commit-1792129352938-022771f0';
            assert.equal(
                keys.commitMetadataKey(commitId),
                'repositories/repo-alpha/commits/commit-1792129352938-022771f0/commit-metadata.json'
            );
            assert.equal(
                keys.commitObjectKey(commitId, 'backend/index.js'),
                'repositories/repo-alpha/commits/commit-1792129352938-022771f0/backend/index.js'
            );
            assert.equal(
                keys.commitObjectKey(commitId, 'package.json'),
                'repositories/repo-alpha/commits/commit-1792129352938-022771f0/package.json'
            );
        });
    });

    describe('3. DVCS v2 & Legacy v1 Commit Metadata DTO', () => {
        test('Validates and normalizes DVCS v2 full-tree snapshot commit metadata', () => {
            const rawV2 = {
                version: 2,
                id: 'commit-1792129352938-022771f0',
                parentCommit: 'commit-1792129352800-87b2aac2',
                message: 'feat: snapshot v2 verified',
                timestamp: '2026-10-16T10:00:00.000Z',
                files: ['backend/index.js', 'package.json'],
                manifest: [
                    { path: 'backend/index.js', size: 4323, isSymlink: false },
                    { path: 'package.json', size: 621, isSymlink: false }
                ],
                reanchoredFromLegacy: false
            };

            const dto = validateCommitMetadata(rawV2);
            assert.equal(dto.version, 2);
            assert.equal(dto.isLegacy, false);
            assert.equal(dto.id, 'commit-1792129352938-022771f0');
            assert.equal(dto.shortId, '1792129');
            assert.equal(dto.parentCommit, 'commit-1792129352800-87b2aac2');
            assert.equal(dto.filesCount, 2);
            assert.equal(dto.manifest.length, 2);
            assert.equal(dto.manifest[0].path, 'backend/index.js');
            assert.equal(dto.manifest[0].size, 4323);
        });

        test('Normalizes legacy v1 commit metadata without error', () => {
            const rawV1 = {
                id: 'commit-1786521399645',
                message: 'legacy commit message',
                timestamp: '2026-08-12T07:56:39.652Z',
                files: ['file.txt']
            };

            const dto = validateCommitMetadata(rawV1);
            assert.equal(dto.version, 1);
            assert.equal(dto.isLegacy, true);
            assert.equal(dto.id, 'commit-1786521399645');
            assert.equal(dto.parentCommit, null);
            assert.equal(dto.filesCount, 1);
            assert.equal(dto.manifest.length, 1);
            assert.equal(dto.manifest[0].path, 'file.txt');
        });

        test('Rejects invalid commit IDs', () => {
            assert.throws(() => validateCommitId('../../etc/passwd'));
            assert.throws(() => validateCommitId('random-id-without-commit-prefix'));
            assert.throws(() => validateCommitId(''));
        });
    });

    describe('4. Directory Tree & Blob DTO Transformations', () => {
        const sampleManifest = [
            { path: 'backend/controllers/add.js', size: 3138, isSymlink: false },
            { path: 'backend/controllers/commit.js', size: 6070, isSymlink: false },
            { path: 'backend/index.js', size: 4323, isSymlink: false },
            { path: 'frontend/src/App.jsx', size: 6857, isSymlink: false },
            { path: 'package.json', size: 621, isSymlink: false },
            { path: 'README.md', size: 1024, isSymlink: false }
        ];

        test('buildTreeDTO at root returns immediate children with folders first', () => {
            const rootTree = buildTreeDTO(sampleManifest, '');
            // Directories should be: backend, frontend
            // Files should be: package.json, README.md
            assert.equal(rootTree.length, 4);

            assert.equal(rootTree[0].name, 'backend');
            assert.equal(rootTree[0].type, 'directory');
            assert.equal(rootTree[0].path, 'backend');

            assert.equal(rootTree[1].name, 'frontend');
            assert.equal(rootTree[1].type, 'directory');

            assert.equal(rootTree[2].name, 'package.json');
            assert.equal(rootTree[2].type, 'file');
            assert.equal(rootTree[2].size, 621);

            assert.equal(rootTree[3].name, 'README.md');
            assert.equal(rootTree[3].type, 'file');
        });

        test('buildTreeDTO within subfolder returns immediate children inside that subfolder', () => {
            const subTree = buildTreeDTO(sampleManifest, 'backend');
            // Children of 'backend':
            // Directory: controllers
            // File: index.js
            assert.equal(subTree.length, 2);
            assert.equal(subTree[0].name, 'controllers');
            assert.equal(subTree[0].type, 'directory');
            assert.equal(subTree[0].path, 'backend/controllers');

            assert.equal(subTree[1].name, 'index.js');
            assert.equal(subTree[1].type, 'file');
            assert.equal(subTree[1].path, 'backend/index.js');
        });

        test('buildTreeDTO within deepest subfolder returns final files', () => {
            const deepTree = buildTreeDTO(sampleManifest, 'backend/controllers');
            assert.equal(deepTree.length, 2);
            assert.equal(deepTree[0].name, 'add.js');
            assert.equal(deepTree[0].type, 'file');
            assert.equal(deepTree[1].name, 'commit.js');
            assert.equal(deepTree[1].type, 'file');
        });

        test('validateBlobDTO normalizes source code payload', () => {
            const blob = validateBlobDTO({
                path: 'backend/index.js',
                content: 'console.log("hello");\nconsole.log("world");'
            });
            assert.equal(blob.path, 'backend/index.js');
            assert.equal(blob.lines, 2);
            assert.equal(blob.size, 43);
            assert.equal(blob.isBinary, false);
        });
    });

    describe('5. Repository and Issue DTO Contracts', () => {
        test('validateRepositoryDTO normalizes full repository entity', () => {
            const repo = validateRepositoryDTO({
                repositoryId: 'repo-gitforge-core',
                name: 'gitforge-core',
                description: 'Core DVCS engine',
                visibility: 'private',
                defaultBranch: 'main',
                headCommitId: 'commit-1792129352938-022771f0',
                owner: '670f1a2b3c4d5e6f7a8b9c0d'
            });

            assert.equal(repo.id, 'repo-gitforge-core');
            assert.equal(repo.name, 'gitforge-core');
            assert.equal(repo.visibility, 'private');
            assert.equal(repo.defaultBranch, 'main');
            assert.equal(repo.headCommitId, 'commit-1792129352938-022771f0');
            assert.equal(repo.storageMode, 'LOCAL_FILESYSTEM');
        });

        test('validateIssueDTO normalizes issue entity', () => {
            const issue = validateIssueDTO({
                id: 'iss-101',
                title: 'Add atomic rollback test',
                description: 'Test backup journal during partial revert failure',
                status: 'open',
                repositoryId: 'repo-gitforge-core',
                author: { username: 'sudharshan' }
            });

            assert.equal(issue.id, 'iss-101');
            assert.equal(issue.title, 'Add atomic rollback test');
            assert.equal(issue.status, 'open');
            assert.equal(issue.repositoryId, 'repo-gitforge-core');
        });

        test('validateIssueDTO rejects missing title', () => {
            assert.throws(() => validateIssueDTO({ repositoryId: 'repo-gitforge-core' }), /title is required/);
        });
    });
});
