import fs from 'fs/promises';
import path from 'path';

async function CommitFile(argv) {
    const message = argv.message || (argv._ && argv._[1]);
    if (!message) {
        console.error('Please specify a commit message. Example: node index.js commit -m "your message"');
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const stagingPath = path.join(repoPath, 'staging');
    const commitsPath = path.join(repoPath, 'commits');

    try {
        await fs.access(repoPath);
    } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
    }

    try {
        const stagedFiles = await fs.readdir(stagingPath);
        if (stagedFiles.length === 0) {
            console.log('No changes staged for commit.');
            return;
        }

        const commitId = `commit-${Date.now()}`;
        const commitDir = path.join(commitsPath, commitId);
        await fs.mkdir(commitDir, { recursive: true });

        // Copy staged files to commit directory
        for (const file of stagedFiles) {
            const src = path.join(stagingPath, file);
            const dest = path.join(commitDir, file);
            await fs.copyFile(src, dest);
            await fs.unlink(src); // Clean up staging files
        }

        // Write metadata
        const metadata = {
            id: commitId,
            message: message,
            timestamp: new Date().toISOString(),
            files: stagedFiles
        };
        await fs.writeFile(path.join(commitDir, 'commit-metadata.json'), JSON.stringify(metadata, null, 2));

        // Update index.json to empty
        await fs.writeFile(path.join(repoPath, 'index.json'), JSON.stringify([]));

        // Update head.json
        await fs.writeFile(path.join(repoPath, 'head.json'), JSON.stringify({ currentCommit: commitId }));

        console.log(`Commit created successfully! ID: ${commitId} - "${message}"`);
    } catch (err) {
        console.error('Error creating commit:', err.message);
    }
}

export default CommitFile;