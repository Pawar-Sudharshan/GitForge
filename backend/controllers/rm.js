import fs from 'fs/promises';
import path from 'path';
import { validatePathSafety } from '../utils/pathSecurity.js';

async function RemoveFile(argv) {
    const file = argv.file || (argv._ && argv._[1]);
    if (!file) {
        console.error('Please specify a file path to remove. Example: node index.js rm <file>');
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

    try {
        // If file exists in staging, remove it from staging
        const stagedFilePath = path.join(stagingPath, relPath);
        try {
            await fs.unlink(stagedFilePath);
        } catch {}

        // Update index.json to record deletion action
        const indexPath = path.join(repoPath, 'index.json');
        let indexList = [];
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            indexList = JSON.parse(indexData);
        } catch {}

        indexList = indexList.filter(item => {
            if (typeof item === 'string') return item !== relPath;
            return item.path !== relPath;
        });

        indexList.push({
            path: relPath,
            action: 'remove'
        });

        await fs.writeFile(indexPath, JSON.stringify(indexList, null, 2));

        // Optionally remove from workspace if requested/present
        const localFilePath = path.resolve(workspaceRoot, relPath);
        try {
            await fs.unlink(localFilePath);
            console.log(`File "${relPath}" removed from workspace and staged for deletion.`);
        } catch {
            console.log(`File "${relPath}" staged for deletion.`);
        }
    } catch (err) {
        console.error(`Error staging removal for "${file}":`, err.message);
    }
}

export default RemoveFile;
