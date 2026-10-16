import fs from 'fs/promises';
import path from 'path';

/**
 * Recursively copies an entire directory structure from src to dest.
 * Ignores 'commit-metadata.json' if ignoreMetadata is true.
 */
export async function copyDirectoryRecursive(src, dest, ignoreMetadata = true) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        if (ignoreMetadata && entry.name === 'commit-metadata.json') {
            continue;
        }

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectoryRecursive(srcPath, destPath, ignoreMetadata);
        } else if (entry.isSymbolicLink()) {
            const linkTarget = await fs.readlink(srcPath);
            try { await fs.unlink(destPath); } catch {}
            await fs.symlink(linkTarget, destPath);
        } else if (entry.isFile()) {
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Builds a file manifest of all relative file paths inside a directory.
 */
export async function buildDirectoryManifest(dirPath, baseDir = dirPath) {
    let manifest = [];
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === 'commit-metadata.json') continue;
            const fullPath = path.join(dirPath, entry.name);
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

            if (entry.isDirectory()) {
                const sub = await buildDirectoryManifest(fullPath, baseDir);
                manifest = manifest.concat(sub);
            } else if (entry.isSymbolicLink()) {
                const linkTarget = await fs.readlink(fullPath);
                manifest.push({
                    path: relPath,
                    isSymlink: true,
                    target: linkTarget.replace(/\\/g, '/')
                });
            } else if (entry.isFile()) {
                const stat = await fs.stat(fullPath);
                manifest.push({
                    path: relPath,
                    size: stat.size,
                    isSymlink: false
                });
            }
        }
    } catch {
        return [];
    }
    return manifest;
}

/**
 * Reconstructs the complete legacy history baseline by traversing from root to parent.
 * Fails safely if lineage cannot be deterministically verified without guessing.
 */
export async function reconstructLegacyBaseline(commitsPath, targetCommitId) {
    const targetDir = path.join(commitsPath, targetCommitId);
    let targetMeta;
    try {
        const data = await fs.readFile(path.join(targetDir, 'commit-metadata.json'), 'utf-8');
        targetMeta = JSON.parse(data);
    } catch {
        throw new Error(`Legacy commit metadata for "${targetCommitId}" could not be read.`);
    }

    // Trace parent lineage if available
    let chain = [];
    let currentId = targetCommitId;
    let visited = new Set();

    while (currentId) {
        if (visited.has(currentId)) {
            throw new Error(`Lineage cycle detected at commit "${currentId}". Cannot reconstruct baseline.`);
        }
        visited.add(currentId);

        const cDir = path.join(commitsPath, currentId);
        let meta;
        try {
            const data = await fs.readFile(path.join(cDir, 'commit-metadata.json'), 'utf-8');
            meta = JSON.parse(data);
        } catch {
            break;
        }

        chain.unshift({ id: currentId, dir: cDir, meta });

        if (meta.parentCommit) {
            currentId = meta.parentCommit;
        } else {
            // Root commit or legacy v1 commit without parentCommit
            currentId = null;
        }
    }

    // If chain has only targetCommitId and there are multiple legacy commits on disk without parentCommit:
    if (chain.length === 1) {
        const allDirs = (await fs.readdir(commitsPath, { withFileTypes: true }))
            .filter(e => e.isDirectory())
            .map(e => e.name);

        if (allDirs.length > 1) {
            // Check if any other commits have parentCommit pointing to target or vice versa
            // If they are all unlinked legacy commits, we cannot guess order from timestamps
            const unlinked = [];
            for (const d of allDirs) {
                try {
                    const m = JSON.parse(await fs.readFile(path.join(commitsPath, d, 'commit-metadata.json'), 'utf-8'));
                    if (!m.parentCommit && !m.version) {
                        unlinked.push(d);
                    }
                } catch {}
            }
            if (unlinked.length > 1 && unlinked.includes(targetCommitId)) {
                throw new Error(
                    `Cannot deterministically establish order for legacy commits without parent linkage. Found ${unlinked.length} unlinked legacy commits. Stopping safely to avoid corruption.`
                );
            }
        }
    }

    return chain;
}
