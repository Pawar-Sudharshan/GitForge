import fs from "fs/promises";
import path from "path";
import { buildDirectoryManifest, copyDirectoryRecursive } from '../utils/snapshotEngine.js';
import { validatePathSafety } from '../utils/pathSecurity.js';

async function RevertFile(argv) {
    const commitId = argv.commitId || (argv._ && argv._[1]);
    const force = Boolean(argv.force || argv.f);

    if (!commitId) {
        console.error(
            "Please specify a commit ID to revert to. Example: node index.js revert <commitId>"
        );
        return;
    }

    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");
    const targetCommitPath = path.join(commitsPath, commitId);
    const headPath = path.join(repoPath, "head.json");
    const workspacePath = process.cwd();

    // Check repository
    try {
        await fs.access(repoPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    // Check target commit
    try {
        await fs.access(targetCommitPath);
    } catch {
        console.error(`Commit ID "${commitId}" not found.`);
        return;
    }

    try {
        console.log(`Reverting workspace to commit: ${commitId}...`);

        // Read target commit metadata
        let targetMeta = {};
        try {
            const data = await fs.readFile(path.join(targetCommitPath, "commit-metadata.json"), "utf-8");
            targetMeta = JSON.parse(data);
        } catch {
            console.error(`Could not read metadata for commit "${commitId}".`);
            return;
        }

        const isLegacy = !(targetMeta.version === 2);
        if (isLegacy) {
            console.warn(`[Notice] Commit "${commitId}" was created using legacy format (v1). Only partial files will be restored.`);
        }

        // Read current HEAD metadata to identify tracked files
        let currentHeadId = null;
        try {
            const headRaw = await fs.readFile(headPath, "utf-8");
            currentHeadId = JSON.parse(headRaw).currentCommit;
        } catch {}

        let currentTrackedFiles = [];
        if (currentHeadId) {
            try {
                const curMetaRaw = await fs.readFile(path.join(commitsPath, currentHeadId, "commit-metadata.json"), "utf-8");
                const curMeta = JSON.parse(curMetaRaw);
                currentTrackedFiles = curMeta.files || [];
            } catch {}
        }

        // Build target manifest
        const targetManifest = await buildDirectoryManifest(targetCommitPath);
        const targetFileSet = new Set(targetManifest.map(m => m.path));

        // Protection check: verify no uncommitted local modifications to tracked files (unless --force)
        if (!force && currentHeadId && currentHeadId !== commitId) {
            for (const file of currentTrackedFiles) {
                const diskPath = path.resolve(workspacePath, file);
                try {
                    const currentInHead = path.join(commitsPath, currentHeadId, file);
                    const [diskContent, headContent] = await Promise.all([
                        fs.readFile(diskPath),
                        fs.readFile(currentInHead)
                    ]);
                    if (!diskContent.equals(headContent)) {
                        console.error(`[Revert Aborted] Uncommitted local modifications detected in "${file}". Use --force to discard.`);
                        return;
                    }
                } catch {}
            }
        }

        // Step 1: Restore all files from target snapshot into workspace
        for (const item of targetManifest) {
            const relPath = validatePathSafety(item.path, workspacePath);
            const srcPath = path.join(targetCommitPath, relPath);
            const destPath = path.join(workspacePath, relPath);

            await fs.mkdir(path.dirname(destPath), { recursive: true });

            if (item.isSymlink) {
                try { await fs.unlink(destPath); } catch {}
                await fs.symlink(item.target, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
            console.log(`Restored: ${relPath}`);
        }

        // Step 2: Safe pruning — ONLY remove files that were tracked in currentHead but absent in target
        // Untracked workspace files are NEVER deleted!
        if (!isLegacy && currentTrackedFiles.length > 0) {
            for (const oldFile of currentTrackedFiles) {
                if (!targetFileSet.has(oldFile)) {
                    const toDelete = path.resolve(workspacePath, oldFile);
                    try {
                        await fs.unlink(toDelete);
                        console.log(`Removed (not in target snapshot): ${oldFile}`);
                    } catch {}
                }
            }
        }

        // Step 3: Update head.json
        await fs.writeFile(headPath, JSON.stringify({ currentCommit: commitId }, null, 2), "utf-8");
        console.log(`\nWorkspace successfully reverted to commit: ${commitId}`);
    } catch (error) {
        console.error(`Error reverting workspace to commit "${commitId}":`, error.message);
    }
}

export default RevertFile;