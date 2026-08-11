import fs from 'fs/promises';
import path from 'path';

async function RevertFile(argv) {
    const commitId = argv.commitId || (argv._ && argv._[1]);
    if (!commitId) {
        console.error('Please specify a commit ID to revert to. Example: node index.js revert <commitId>');
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const commitsPath = path.join(repoPath, 'commits');
    const targetCommitPath = path.join(commitsPath, commitId);

    try {
        await fs.access(repoPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    try {
        await fs.access(targetCommitPath);
    } catch {
        console.error(`Commit ID "${commitId}" not found.`);
        return;
    }

    try {
        const commitFiles = await fs.readdir(targetCommitPath);
        const workspacePath = process.cwd();

        for (const file of commitFiles) {
            if (file === 'commit-metadata.json') continue;
            const src = path.join(targetCommitPath, file);
            const dest = path.join(workspacePath, file);
            await fs.copyFile(src, dest);
        }

        // Update head.json
        await fs.writeFile(path.join(repoPath, 'head.json'), JSON.stringify({ currentCommit: commitId }));

        console.log(`Workspace successfully reverted to commit: ${commitId}`);
    } catch (err) {
        console.error(`Error reverting workspace to commit "${commitId}":`, err.message);
    }
}

export default RevertFile;