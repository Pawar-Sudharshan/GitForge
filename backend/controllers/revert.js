import fs from "fs/promises";
import path from "path";

async function RevertFile(argv) {
    const commitId = argv.commitId || (argv._ && argv._[1]);

    if (!commitId) {
        console.error(
            "Please specify a commit ID to revert to. Example: node index.js revert <commitId>"
        );
        return;
    }

    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");
    const targetCommitPath = path.join(commitsPath, commitId);
    const workspacePath = process.cwd();

    // Check repository
    try {
        await fs.access(repoPath);
    } catch {
        console.error(
            'Repository not initialized. Run "node index.js init" first.'
        );
        return;
    }

    // Check commits directory
    try {
        await fs.access(commitsPath);
    } catch {
        console.error("Commits directory not found.");
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

        /**
         * Recursively copy files from the commit directory
         * to the workspace.
         */
        async function restoreDirectory(sourceDir, destinationDir) {
            const entries = await fs.readdir(sourceDir, {
                withFileTypes: true,
            });

            for (const entry of entries) {
                // Skip commit metadata
                if (entry.name === "commit-metadata.json") {
                    continue;
                }

                const sourcePath = path.join(sourceDir, entry.name);
                const destinationPath = path.join(
                    destinationDir,
                    entry.name
                );

                if (entry.isDirectory()) {
                    // Create destination directory
                    await fs.mkdir(destinationPath, {
                        recursive: true,
                    });

                    // Recursively restore files
                    await restoreDirectory(
                        sourcePath,
                        destinationPath
                    );
                } else if (entry.isFile()) {
                    // Make sure parent directory exists
                    await fs.mkdir(
                        path.dirname(destinationPath),
                        {
                            recursive: true,
                        }
                    );

                    await fs.copyFile(
                        sourcePath,
                        destinationPath
                    );

                    console.log(
                        `Restored: ${path.relative(
                            workspacePath,
                            destinationPath
                        )}`
                    );
                }
            }
        }

        // Restore commit files
        await restoreDirectory(
            targetCommitPath,
            workspacePath
        );

        // Update head.json
        const headPath = path.join(repoPath, "head.json");

        const headData = {
            currentCommit: commitId,
        };

        await fs.writeFile(
            headPath,
            JSON.stringify(headData, null, 2),
            "utf-8"
        );

        console.log(
            `\nWorkspace successfully reverted to commit: ${commitId}`
        );
    } catch (error) {
        console.error(
            `Error reverting workspace to commit "${commitId}":`,
            error.message
        );
    }
}

export default RevertFile;