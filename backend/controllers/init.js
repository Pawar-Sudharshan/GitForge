import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { sanitizeRepoId } from '../utils/pathSecurity.js';

async function initRepo(argv = {}) {
    const repoPath = path.resolve(process.cwd(), '.apnaGit');
    const commitsPath = path.join(repoPath, 'commits');
    const stagingPath = path.join(repoPath, 'staging');
    const configPath = path.join(repoPath, 'config.json');

    let customRepoId = argv.repoId || (argv._ && argv._[1]);
    let repositoryId;
    if (customRepoId) {
        try {
            repositoryId = sanitizeRepoId(customRepoId);
        } catch (err) {
            console.error(err.message);
            return;
        }
    } else {
        repositoryId = `repo-${crypto.randomUUID()}`;
    }

    try {
        await fs.access(repoPath);
        console.log('Repository (.apnaGit) is already initialized.');

        // Self-heal config.json if missing
        try {
            await fs.access(configPath);
        } catch {
            const configData = {
                repositoryId,
                version: 2
            };
            await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
            console.log(`Created repository configuration with ID: ${repositoryId}`);
        }
    } catch (error) {
        try {
            await fs.mkdir(repoPath, { recursive: true });
            await fs.mkdir(commitsPath, { recursive: true });
            await fs.mkdir(stagingPath, { recursive: true });
            
            // Create default head, index, and config files
            await fs.writeFile(path.join(repoPath, 'index.json'), JSON.stringify([]));
            await fs.writeFile(path.join(repoPath, 'head.json'), JSON.stringify({ currentCommit: null }));
            await fs.writeFile(configPath, JSON.stringify({ repositoryId, version: 2 }, null, 2));

            console.log(`Repository initialized successfully with ID: ${repositoryId}. Created .apnaGit folder structure.`);
        } catch (err) {
            console.error('Error initializing repository:', err.message);
        }
    }
}

export default initRepo;