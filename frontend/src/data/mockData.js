/**
 * Realistic GitForge DVCS Repository Data & Lineage Graph
 * Based on the actual Phase 2 implementation of ApnaGit (Full-Tree Snapshots & Parent Commit Lineage).
 */

export const MOCK_REPOSITORIES = [
  {
    id: "repo-apnagit-core",
    name: "apnaGit-core",
    description: "Distributed version control system engine with deterministic full-tree snapshots and safe revert.",
    localPath: "C:\\project2",
    visibility: "private",
    defaultBranch: "main",
    headCommitId: "c8f3a91720d418290f9b",
    storageMode: "LOCAL_FILESYSTEM",
    s3SyncStatus: "DISCONNECTED_NO_CREDENTIALS",
    trackedFilesCount: 9,
    snapshotSizeBytes: 38920,
    lastModified: "2026-10-15T19:42:10Z",
    commits: [
      {
        id: "c8f3a91720d418290f9b",
        shortId: "c8f3a91",
        parentCommit: "4b2e810398ef918230aa",
        message: "feat: add deletion staging (rm.js) and path traversal security validation",
        author: "Sudharshan Pawar <sudharshan@gitforge.local>",
        timestamp: "2026-10-15T19:42:10Z",
        treeSnapshot: [
          "backend/index.js",
          "backend/controllers/add.js",
          "backend/controllers/commit.js",
          "backend/controllers/revert.js",
          "backend/controllers/rm.js",
          "backend/controllers/push.js",
          "backend/utils/pathSecurity.js",
          "backend/utils/snapshotEngine.js",
          "backend/package.json"
        ],
        changes: {
          added: ["backend/controllers/rm.js", "backend/utils/pathSecurity.js"],
          modified: ["backend/controllers/commit.js", "backend/controllers/revert.js"],
          deleted: []
        }
      },
      {
        id: "4b2e810398ef918230aa",
        shortId: "4b2e810",
        parentCommit: "19f4a029ab12ec0955cd",
        message: "feat: full-tree snapshot restoration and untracked file preservation during revert",
        author: "Sudharshan Pawar <sudharshan@gitforge.local>",
        timestamp: "2026-10-15T16:15:00Z",
        treeSnapshot: [
          "backend/index.js",
          "backend/controllers/add.js",
          "backend/controllers/commit.js",
          "backend/controllers/revert.js",
          "backend/controllers/push.js",
          "backend/utils/snapshotEngine.js",
          "backend/package.json"
        ],
        changes: {
          added: ["backend/utils/snapshotEngine.js"],
          modified: ["backend/controllers/revert.js"],
          deleted: []
        }
      },
      {
        id: "19f4a029ab12ec0955cd",
        shortId: "19f4a02",
        parentCommit: "00a12f864bc1982a31ef",
        message: "feat: parentCommit lineage pointer and isolated repository S3 key prefixes",
        author: "Sudharshan Pawar <sudharshan@gitforge.local>",
        timestamp: "2026-10-15T12:08:44Z",
        treeSnapshot: [
          "backend/index.js",
          "backend/controllers/add.js",
          "backend/controllers/commit.js",
          "backend/controllers/revert.js",
          "backend/controllers/push.js",
          "backend/package.json"
        ],
        changes: {
          added: ["backend/controllers/push.js"],
          modified: ["backend/controllers/commit.js"],
          deleted: []
        }
      },
      {
        id: "00a12f864bc1982a31ef",
        shortId: "00a12f8",
        parentCommit: null,
        message: "chore: initial ApnaGit CLI repository structure & staging controllers",
        author: "Sudharshan Pawar <sudharshan@gitforge.local>",
        timestamp: "2026-10-14T20:30:00Z",
        treeSnapshot: [
          "backend/index.js",
          "backend/controllers/add.js",
          "backend/controllers/commit.js",
          "backend/controllers/revert.js",
          "backend/package.json"
        ],
        changes: {
          added: [
            "backend/index.js",
            "backend/controllers/add.js",
            "backend/controllers/commit.js",
            "backend/controllers/revert.js",
            "backend/package.json"
          ],
          modified: [],
          deleted: []
        }
      }
    ],
    fileTree: [
      {
        name: "backend",
        type: "directory",
        path: "backend",
        children: [
          {
            name: "controllers",
            type: "directory",
            path: "backend/controllers",
            children: [
              {
                name: "commit.js",
                type: "file",
                path: "backend/controllers/commit.js",
                size: "6.1 KB",
                language: "javascript",
                content: `import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { resolveSafeRepoPath } from "../utils/pathSecurity.js";
import { reconstructFullSnapshot } from "../utils/snapshotEngine.js";

/**
 * ApnaGit Phase 2 Commit Controller
 * Writes full-tree snapshot and records explicit parentCommit lineage.
 */
async function commit(argv) {
  const repoPath = resolveSafeRepoPath(process.cwd());
  const apnaGitPath = path.join(repoPath, ".apnaGit");
  const stagingPath = path.join(apnaGitPath, "staging");
  const headPath = path.join(apnaGitPath, "head.json");

  // Read current HEAD for parent linkage
  let parentCommit = null;
  try {
    const headRaw = await fs.readFile(headPath, "utf-8");
    const headData = JSON.parse(headRaw);
    parentCommit = headData.commitId || null;
  } catch {
    parentCommit = null;
  }

  const commitId = uuidv4().replace(/-/g, "").substring(0, 20);
  const commitDir = path.join(apnaGitPath, "commits", commitId);
  await fs.mkdir(commitDir, { recursive: true });

  // Materialize full snapshot
  const manifest = await reconstructFullSnapshot({
    stagingPath,
    parentCommit,
    commitDir
  });

  const metadata = {
    commitId,
    parentCommit,
    message: argv.message || "Snapshot commit",
    timestamp: new Date().toISOString(),
    manifest
  };

  await fs.writeFile(
    path.join(commitDir, "commit.json"),
    JSON.stringify(metadata, null, 2)
  );

  // Update HEAD pointer
  await fs.writeFile(
    headPath,
    JSON.stringify({ commitId, updated: new Date().toISOString() }, null, 2)
  );

  console.log(\`[apnaGit] Committed snapshot \${commitId} (parent: \${parentCommit || "root"})\`);
}

export default commit;`
              },
              {
                name: "revert.js",
                type: "file",
                path: "backend/controllers/revert.js",
                size: "5.4 KB",
                language: "javascript",
                content: `import fs from "fs/promises";
import path from "path";
import { resolveSafeRepoPath, validateRelativePath } from "../utils/pathSecurity.js";

/**
 * ApnaGit Phase 2 Safe Revert
 * Preserves untracked workspace files while restoring snapshot state.
 */
async function revert(argv) {
  const targetCommitId = argv.commitId;
  if (!targetCommitId) {
    throw new Error("Target commitId required for revert");
  }

  const repoRoot = resolveSafeRepoPath(process.cwd());
  const apnaGitPath = path.join(repoRoot, ".apnaGit");
  const targetDir = path.join(apnaGitPath, "commits", targetCommitId);

  // Verify commit exists
  const metaRaw = await fs.readFile(path.join(targetDir, "commit.json"), "utf-8");
  const targetMeta = JSON.parse(metaRaw);

  console.log(\`Restoring full-tree snapshot \${targetCommitId}...\`);
  
  // Untracked files outside snapshot manifest are preserved
  for (const relativePath of targetMeta.manifest) {
    validateRelativePath(repoRoot, relativePath);
    const srcFile = path.join(targetDir, "snapshot", relativePath);
    const destFile = path.join(repoRoot, relativePath);
    await fs.mkdir(path.dirname(destFile), { recursive: true });
    await fs.copyFile(srcFile, destFile);
  }

  // Update local HEAD
  await fs.writeFile(
    path.join(apnaGitPath, "head.json"),
    JSON.stringify({ commitId: targetCommitId, revertedAt: new Date().toISOString() }, null, 2)
  );

  console.log(\`Successfully reverted to snapshot \${targetCommitId}\`);
}

export default revert;`
              },
              {
                name: "rm.js",
                type: "file",
                path: "backend/controllers/rm.js",
                size: "2.2 KB",
                language: "javascript",
                content: `import fs from "fs/promises";
import path from "path";
import { resolveSafeRepoPath, validateRelativePath } from "../utils/pathSecurity.js";

/**
 * ApnaGit Deletion Staging
 * Records tombstones in staging so deletions propagate to the next snapshot.
 */
async function rm(argv) {
  const repoRoot = resolveSafeRepoPath(process.cwd());
  const relPath = validateRelativePath(repoRoot, argv.file);
  const stagingPath = path.join(repoRoot, ".apnaGit", "staging");

  const tombstoneFile = path.join(stagingPath, \`\${relPath}.deleted\`);
  await fs.mkdir(path.dirname(tombstoneFile), { recursive: true });
  await fs.writeFile(tombstoneFile, JSON.stringify({ deletedAt: new Date().toISOString() }));

  // Remove working copy if present
  const targetFile = path.join(repoRoot, relPath);
  try {
    await fs.unlink(targetFile);
  } catch (err) {
    // File may already be absent
  }

  console.log(\`Staged deletion: \${relPath}\`);
}

export default rm;`
              }
            ]
          },
          {
            name: "utils",
            type: "directory",
            path: "backend/utils",
            children: [
              {
                name: "pathSecurity.js",
                type: "file",
                path: "backend/utils/pathSecurity.js",
                size: "5.9 KB",
                language: "javascript",
                content: `import path from "path";

/**
 * Path Security & Traversal Defense
 * Blocks directory traversal (..), UNC escapes, and out-of-boundary paths.
 */
export function validateRelativePath(rootPath, userPath) {
  if (path.isAbsolute(userPath)) {
    throw new Error(\`Absolute path rejected: \${userPath}\`);
  }
  
  const normalized = path.normalize(userPath).replace(/^[\\/\\\\]+/, "");
  if (normalized.startsWith("..") || normalized.includes(\`..\${path.sep}\`)) {
    throw new Error(\`Directory traversal attempt blocked: \${userPath}\`);
  }

  const resolved = path.resolve(rootPath, normalized);
  if (!resolved.startsWith(path.resolve(rootPath))) {
    throw new Error(\`Path escapes repository root: \${userPath}\`);
  }

  return normalized.replace(/\\\\/g, "/");
}

export function resolveSafeRepoPath(cwd) {
  return path.resolve(cwd);
}`
              },
              {
                name: "snapshotEngine.js",
                type: "file",
                path: "backend/utils/snapshotEngine.js",
                size: "5.2 KB",
                language: "javascript",
                content: `import fs from "fs/promises";
import path from "path";

/**
 * Reconstructs a complete repository snapshot by applying staged changes
 * onto the parent commit's file tree baseline.
 */
export async function reconstructFullSnapshot({ stagingPath, parentCommit, commitDir }) {
  const snapshotDir = path.join(commitDir, "snapshot");
  await fs.mkdir(snapshotDir, { recursive: true });

  const manifest = [];
  // 1. Inherit parent snapshot files if parent exists
  // 2. Overlay staged modifications
  // 3. Purge paths with .deleted tombstones

  return manifest;
}`
              }
            ]
          },
          {
            name: "index.js",
            type: "file",
            path: "backend/index.js",
            size: "3.9 KB",
            language: "javascript",
            content: `import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import initRepo from "./controllers/init.js";
import AddFile from "./controllers/add.js";
import CommitFile from "./controllers/commit.js";
import RevertFile from "./controllers/revert.js";
import RemoveFile from "./controllers/rm.js";

const cli = yargs(hideBin(process.argv))
  .command("init", "Initialize new repo", {}, (argv) => initRepo(argv))
  .command("add <file>", "Add files to stage", {}, (argv) => AddFile(argv))
  .command("commit <message>", "Save staged changes to snapshot history", {}, (argv) => CommitFile(argv))
  .command("revert <commitId>", "Revert to a previous commit", {}, (argv) => RevertFile(argv))
  .command("rm <file>", "Remove a file and stage deletion", {}, (argv) => RemoveFile(argv))
  .demandCommand(1)
  .help();

await cli.parseAsync();`
          },
          {
            name: "package.json",
            type: "file",
            path: "backend/package.json",
            size: "505 B",
            language: "json",
            content: `{
  "name": "gitforge-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.22.2",
    "yargs": "^18.1.0"
  }
}`
          }
        ]
      },
      {
        name: "README.md",
        type: "file",
        path: "README.md",
        size: "1.4 KB",
        language: "markdown",
        content: `# GitForge (ApnaGit)
Deterministic, local-first distributed version control system.

## Architectural Principles
- **Full-tree snapshots**: Every commit stores the comprehensive file tree manifest.
- **Explicit parent lineage**: Strict DAG tracking with \`parentCommit\` hashes.
- **Safe revert**: Reversion never touches untracked or independent workspace files.
- **Path Traversal Security**: Strict rejection of absolute and UNC escape paths.`
      }
    ]
  },
  {
    id: "repo-alloy-parser",
    name: "alloy-parser",
    description: "Fast recursive-descent lexer and AST generator with zero external runtime dependencies.",
    localPath: "C:\\project2\\storage\\repos\\alloy-parser",
    visibility: "private",
    defaultBranch: "main",
    headCommitId: "91e0a245bc8819024f8d",
    storageMode: "LOCAL_FILESYSTEM",
    s3SyncStatus: "DISCONNECTED_NO_CREDENTIALS",
    trackedFilesCount: 6,
    snapshotSizeBytes: 18450,
    lastModified: "2026-10-15T14:10:00Z",
    commits: [
      {
        id: "91e0a245bc8819024f8d",
        shortId: "91e0a24",
        parentCommit: "23fa9901bd77002199ae",
        message: "fix: handle multiline string escapes in lexer scanner",
        author: "Sudharshan Pawar <sudharshan@gitforge.local>",
        timestamp: "2026-10-15T14:10:00Z",
        treeSnapshot: ["src/lexer.js", "src/token.js", "src/parser.js", "package.json"],
        changes: { added: [], modified: ["src/lexer.js"], deleted: [] }
      },
      {
        id: "23fa9901bd77002199ae",
        shortId: "23fa990",
        parentCommit: null,
        message: "feat: initial lexer tokenizer and token definitions",
        author: "Sudharshan Pawar <sudharshan@gitforge.local>",
        timestamp: "2026-10-14T09:00:00Z",
        treeSnapshot: ["src/lexer.js", "src/token.js", "package.json"],
        changes: { added: ["src/lexer.js", "src/token.js", "package.json"], modified: [], deleted: [] }
      }
    ],
    fileTree: [
      {
        name: "src",
        type: "directory",
        path: "src",
        children: [
          {
            name: "lexer.js",
            type: "file",
            path: "src/lexer.js",
            size: "3.2 KB",
            language: "javascript",
            content: `export class Lexer {
  constructor(source) {
    this.source = source;
    this.cursor = 0;
  }
  nextToken() {
    // Lexical scanning
    return null;
  }
}`
          },
          {
            name: "token.js",
            type: "file",
            path: "src/token.js",
            size: "1.1 KB",
            language: "javascript",
            content: `export const TokenType = {
  IDENTIFIER: "IDENTIFIER",
  KEYWORD: "KEYWORD",
  EOF: "EOF"
};`
          }
        ]
      },
      {
        name: "package.json",
        type: "file",
        path: "package.json",
        size: "320 B",
        language: "json",
        content: `{\n  "name": "alloy-parser",\n  "version": "0.1.0"\n}`
      }
    ]
  }
];

export const MOCK_ISSUES = [
  {
    id: "iss-101",
    repoId: "repo-apnagit-core",
    title: "Verify safe symlink loop resolution during full-tree staging",
    status: "open",
    author: "sudharshan",
    createdAt: "2026-10-15T18:00:00Z",
    tag: "dvcs-engine",
    commentsCount: 3,
    description: "In-repository relative symlinks are allowed, but cyclic symlinks should error cleanly without triggering recursive stack overflows."
  },
  {
    id: "iss-102",
    repoId: "repo-apnagit-core",
    title: "S3 conditional write header fallback when x-amz-if-none-match is rejected by mock proxy",
    status: "closed",
    author: "sudharshan",
    createdAt: "2026-10-15T11:20:00Z",
    tag: "s3-sync",
    commentsCount: 4,
    description: "Verified in Phase 2 audit: When S3 credentials are missing or mocked, the system maintains strict local-first fallback mode."
  },
  {
    id: "iss-103",
    repoId: "repo-apnagit-core",
    title: "Add regression tests for interrupted push and pull operations",
    status: "closed",
    author: "sudharshan",
    createdAt: "2026-10-14T19:00:00Z",
    tag: "testing",
    commentsCount: 2,
    description: "Phase 2 verification test suite validated 10/10 test cases covering interrupted uploads, parent DAG consistency, and path security."
  }
];
