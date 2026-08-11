import fs from 'fs/promises';
import path from 'path';

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const commitsPath = path.join(repoPath, 'commits');
    const stagingPath = path.join(repoPath, 'staging');

    try {
        await fs.access(repoPath);
        console.log('Repository (.apnaGit) is already initialized.');
    } catch (error) {
        try {
            await fs.mkdir(repoPath, { recursive: true });
            await fs.mkdir(commitsPath, { recursive: true });
            await fs.mkdir(stagingPath, { recursive: true });
            
            // Create a default head/index files
            await fs.writeFile(path.join(repoPath, 'index.json'), JSON.stringify([]));
            await fs.writeFile(path.join(repoPath, 'head.json'), JSON.stringify({ currentCommit: null }));

            console.log('Repository initialized successfully. Created .apnaGit folder structure.');
        } catch (err) {
            console.error('Error initializing repository:', err.message);
        }
    }
}

export default initRepo;