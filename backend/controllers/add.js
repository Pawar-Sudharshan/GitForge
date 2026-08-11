import fs from 'fs/promises';
import path from 'path';

async function AddFile(argv) {
    const file = argv.file || (argv._ && argv._[1]);
    if (!file) {
        console.error('Please specify a file path to add. Example: node index.js add <file>');
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const stagingPath = path.join(repoPath, 'staging');

    try {
        await fs.access(repoPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    const sourcePath = path.resolve(process.cwd(), file);
    try {
        const stats = await fs.stat(sourcePath);
        if (stats.isDirectory()) {
            console.error('Adding directories is not supported yet. Please add specific files.');
            return;
        }

        // Copy file to staging
        const fileName = path.basename(sourcePath);
        const destPath = path.join(stagingPath, fileName);
        await fs.copyFile(sourcePath, destPath);

        // Update index.json list
        const indexPath = path.join(repoPath, 'index.json');
        let indexList = [];
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            indexList = JSON.parse(indexData);
        } catch {}

        if (!indexList.includes(fileName)) {
            indexList.push(fileName);
            await fs.writeFile(indexPath, JSON.stringify(indexList));
        }

        console.log(`File "${fileName}" staged successfully.`);
    } catch (err) {
        console.error(`Error staging file "${file}":`, err.message);
    }
}

export default AddFile;