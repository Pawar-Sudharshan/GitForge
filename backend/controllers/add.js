import fs from 'fs/promises';
import path from 'path';

import { validatePathSafety, isExcluded, inspectSymlinkSafety } from '../utils/pathSecurity.js';

async function AddFile(argv) {
    const file = argv.file || (argv._ && argv._[1]);
    if (!file) {
        console.error('Please specify a file path to add. Example: node index.js add <file>');
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const stagingPath = path.join(repoPath, 'staging');
    const workspaceRoot = process.cwd();

    try {
        await fs.access(repoPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    let relPath;
    try {
        relPath = validatePathSafety(file, workspaceRoot);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return;
    }

    // Check exclusion policy
    if (isExcluded(relPath)) {
        console.error(`[Excluded] "${relPath}" matches an excluded secret or system pattern and cannot be added.`);
        return;
    }

    const sourcePath = path.resolve(workspaceRoot, relPath);

    try {
        // Check for symlinks and symlink safety
        const symlinkInfo = await inspectSymlinkSafety(sourcePath, workspaceRoot);

        const stats = await fs.lstat(sourcePath);
        if (stats.isDirectory()) {
            console.error('Adding directories is not supported yet. Please add specific files.');
            return;
        }

        const destPath = path.join(stagingPath, relPath);
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        if (symlinkInfo.isSymlink) {
            // Remove existing staging item if present
            try { await fs.unlink(destPath); } catch {}
            // Create symlink in staging pointing to same relative target
            await fs.symlink(symlinkInfo.target, destPath);
        } else {
            await fs.copyFile(sourcePath, destPath);
        }

        // Update index.json (structured format supporting paths)
        const indexPath = path.join(repoPath, 'index.json');
        let indexList = [];
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            indexList = JSON.parse(indexData);
        } catch {}

        // Remove any prior entry for this path
        indexList = indexList.filter(item => {
            if (typeof item === 'string') return item !== relPath;
            return item.path !== relPath;
        });

        // Store structured object with toString fallback or plain entry with metadata
        indexList.push({
            path: relPath,
            action: 'add',
            isSymlink: symlinkInfo.isSymlink,
            symlinkTarget: symlinkInfo.target || null
        });

        await fs.writeFile(indexPath, JSON.stringify(indexList, null, 2));
        console.log(`File "${relPath}" staged successfully.`);
    } catch (err) {
        console.error(`Error staging file "${file}":`, err.message);
    }
}

export default AddFile;