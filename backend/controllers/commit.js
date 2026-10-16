import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { copyDirectoryRecursive, buildDirectoryManifest, reconstructLegacyBaseline } from '../utils/snapshotEngine.js';

async function CommitFile(argv) {
    const message = argv.message || (argv._ && argv._[1]);
    if (!message) {
        console.error('Please specify a commit message. Example: node index.js commit -m "your message"');
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const stagingPath = path.join(repoPath, 'staging');
    const commitsPath = path.join(repoPath, 'commits');
    const indexPath = path.join(repoPath, 'index.json');
    const headPath = path.join(repoPath, 'head.json');

    try {
        await fs.access(repoPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    try {
        // Read staging index
        let indexList = [];
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            indexList = JSON.parse(indexData);
        } catch {}

        if (indexList.length === 0) {
            console.log('No changes staged for commit.');
            return;
        }

        // Read current HEAD
        let headData = { currentCommit: null };
        try {
            const headRaw = await fs.readFile(headPath, 'utf-8');
            headData = JSON.parse(headRaw);
        } catch {}

        const parentCommitId = headData.currentCommit || null;
        const commitId = `commit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const commitDir = path.join(commitsPath, commitId);
        await fs.mkdir(commitDir, { recursive: true });

        // Step 1: If parent commit exists, inherit previous snapshot tree
        let reanchoredFromLegacy = false;
        if (parentCommitId) {
            const parentDir = path.join(commitsPath, parentCommitId);
            let parentMeta = {};
            try {
                parentMeta = JSON.parse(await fs.readFile(path.join(parentDir, 'commit-metadata.json'), 'utf-8'));
            } catch {}

            if (parentMeta.version === 2) {
                // Parent is a verified full-tree snapshot: copy entire tree
                await copyDirectoryRecursive(parentDir, commitDir, true);
            } else {
                // Parent is a legacy commit: reconstruct history baseline from root
                try {
                    console.log(`Reconstructing baseline lineage for legacy parent commit "${parentCommitId}"...`);
                    const chain = await reconstructLegacyBaseline(commitsPath, parentCommitId);
                    for (const step of chain) {
                        await copyDirectoryRecursive(step.dir, commitDir, true);
                    }
                    reanchoredFromLegacy = true;
                } catch (reconErr) {
                    // Safe failure: clean up new commitDir and abort
                    await fs.rm(commitDir, { recursive: true, force: true });
                    console.error(`[Commit Aborted] ${reconErr.message}`);
                    return;
                }
            }
        }

        // Step 2: Apply staged changes (additions, modifications, deletions)
        for (const item of indexList) {
            const relPath = typeof item === 'string' ? item : item.path;
            const action = typeof item === 'string' ? 'add' : (item.action || 'add');
            const targetInCommit = path.join(commitDir, relPath);

            if (action === 'remove') {
                // Delete from new commit snapshot
                try {
                    await fs.unlink(targetInCommit);
                } catch {}
            } else {
                // Copy from staging
                const srcStaged = path.join(stagingPath, relPath);
                try {
                    const stat = await fs.lstat(srcStaged);
                    await fs.mkdir(path.dirname(targetInCommit), { recursive: true });
                    if (stat.isSymbolicLink()) {
                        const target = await fs.readlink(srcStaged);
                        try { await fs.unlink(targetInCommit); } catch {}
                        await fs.symlink(target, targetInCommit);
                    } else {
                        await fs.copyFile(srcStaged, targetInCommit);
                    }
                } catch (copyErr) {
                    console.warn(`Warning: Could not copy staged file "${relPath}":`, copyErr.message);
                }
            }
        }

        // Step 3: Build manifest of the complete snapshot
        const manifest = await buildDirectoryManifest(commitDir);
        const filesList = manifest.map(m => m.path);

        // Step 4: Write commit metadata
        const metadata = {
            version: 2,
            id: commitId,
            parentCommit: parentCommitId,
            message: message,
            timestamp: new Date().toISOString(),
            files: filesList,
            manifest: manifest,
            reanchoredFromLegacy
        };

        await fs.writeFile(path.join(commitDir, 'commit-metadata.json'), JSON.stringify(metadata, null, 2));

        // Step 5: Clean staging directory contents safely
        try {
            await fs.rm(stagingPath, { recursive: true, force: true });
            await fs.mkdir(stagingPath, { recursive: true });
        } catch {}

        // Step 6: Clear index.json
        await fs.writeFile(indexPath, JSON.stringify([], null, 2));

        // Step 7: Update head.json to point to new commit
        await fs.writeFile(headPath, JSON.stringify({ currentCommit: commitId }, null, 2));

        console.log(`Commit created successfully! ID: ${commitId} - "${message}"`);
    } catch (err) {
        console.error('Error creating commit:', err.message);
    }
}

export default CommitFile;