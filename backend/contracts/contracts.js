import path from 'path';

/**
 * GitForge / ApnaGit Phase 0 Architecture Contracts & Schema Engine
 * Provides single source of truth for:
 * 1. Configurable REPOSITORIES_ROOT_DIR resolution & repository boundary containment
 * 2. Phase 2 AWS S3 Remote Key layout preservation (repo-state/head.json)
 * 3. DVCS v2 Commit Metadata & Snapshot Manifest DTO validation
 * 4. Directory Tree & Blob DTO transformations
 * 5. Repository & Issue DTO specifications
 */

/**
 * Resolves the root directory where all multi-repository sandboxes reside.
 * Defaults safely to `<cwd>/storage/repositories` unless configured via REPOSITORIES_ROOT_DIR.
 *
 * @param {string} [overrideEnv] - Optional override for testing.
 * @returns {string} - Absolute normalized path to storage root.
 */
export function getStorageRoot(overrideEnv = process.env.REPOSITORIES_ROOT_DIR) {
    if (overrideEnv && typeof overrideEnv === 'string' && overrideEnv.trim()) {
        return path.resolve(overrideEnv.trim());
    }
    return path.resolve(process.cwd(), 'storage', 'repositories');
}

/**
 * Validates and sanitizes a repository identifier.
 * Rules:
 * - Must be non-empty string between 3 and 64 characters
 * - Only alphanumeric characters, dashes, and underscores allowed
 * - Cannot contain path traversal or slashes
 *
 * @param {string} rawId
 * @returns {string} - Sanitized repository ID
 */
export function sanitizeRepoId(rawId) {
    if (typeof rawId !== 'string' || !rawId.trim()) {
        throw new Error('Repository ID must be a non-empty string.');
    }
    const trimmed = rawId.trim();
    if (!/^[a-zA-Z0-9_-]{3,64}$/.test(trimmed)) {
        throw new Error(`Invalid repository ID "${rawId}". Must be 3-64 alphanumeric characters, dashes, or underscores.`);
    }
    return trimmed;
}

/**
 * Validates a commit identifier.
 * Matches: commit-<timestamp>-<hex> (v2) or commit-<timestamp> (legacy v1)
 *
 * @param {string} rawCommitId
 * @returns {string}
 */
export function validateCommitId(rawCommitId) {
    if (typeof rawCommitId !== 'string' || !rawCommitId.trim()) {
        throw new Error('Commit ID must be a non-empty string.');
    }
    const trimmed = rawCommitId.trim();
    if (!/^commit-[a-zA-Z0-9_-]+$/.test(trimmed)) {
        throw new Error(`Invalid commit ID format: "${rawCommitId}".`);
    }
    return trimmed;
}

/**
 * Resolves the isolated filesystem root for a specific repository.
 * Enforces strict containment inside REPOSITORIES_ROOT_DIR.
 *
 * @param {string} repoId - The repository ID.
 * @param {string} [storageRoot] - Optional storage root override.
 * @returns {string} - Safe absolute path to repository directory.
 */
export function resolveRepoPath(repoId, storageRoot = getStorageRoot()) {
    const cleanId = sanitizeRepoId(repoId);
    const resolvedRoot = path.resolve(storageRoot);
    const resolvedRepo = path.resolve(resolvedRoot, cleanId);

    // Containment assertion: repoPath must strictly be a child of resolvedRoot
    const expectedPrefix = resolvedRoot + path.sep;
    if (resolvedRepo !== resolvedRoot && !resolvedRepo.startsWith(expectedPrefix)) {
        throw new Error(`Security Violation: Repository "${repoId}" escapes storage root.`);
    }

    return resolvedRepo;
}

/**
 * Preserves the exact Phase 2 AWS S3 Remote Key Hierarchy.
 * In accordance with Phase 2 push.js and pull.js:
 * - Remote HEAD is stored at `repositories/<repoId>/repo-state/head.json`
 * - Commits are stored at `repositories/<repoId>/commits/<commitId>/`
 *
 * @param {string} repoId - Sanitized repository ID.
 * @returns {object} - S3 key builders and prefixes.
 */
export function getS3Keys(repoId) {
    const cleanId = sanitizeRepoId(repoId);
    const s3Prefix = `repositories/${cleanId}`;

    return {
        prefix: s3Prefix,
        commitsPrefix: `${s3Prefix}/commits/`,
        headKey: `${s3Prefix}/repo-state/head.json`, // Preserved Phase 2 remote HEAD key
        configKey: `${s3Prefix}/config.json`,
        commitMetadataKey: (commitId) => `${s3Prefix}/commits/${validateCommitId(commitId)}/commit-metadata.json`,
        commitObjectKey: (commitId, relPath) => {
            const cleanPath = (relPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
            return `${s3Prefix}/commits/${validateCommitId(commitId)}/${cleanPath}`;
        }
    };
}

/**
 * Validates and normalizes commit metadata from disk (DVCS v2 or legacy v1).
 *
 * @param {object} raw - Parsed JSON from commit-metadata.json.
 * @returns {object} - Normalized CommitDTO.
 */
export function validateCommitMetadata(raw) {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Commit metadata must be a valid JSON object.');
    }

    const id = validateCommitId(raw.id);
    const message = typeof raw.message === 'string' ? raw.message : '(no commit message)';
    const timestamp = raw.timestamp && !isNaN(Date.parse(raw.timestamp))
        ? new Date(raw.timestamp).toISOString()
        : new Date().toISOString();

    const isV2 = raw.version === 2;
    const parentCommit = raw.parentCommit ? validateCommitId(raw.parentCommit) : null;
    const files = Array.isArray(raw.files) ? raw.files.map(f => String(f).replace(/\\/g, '/')) : [];

    // Manifest array validation (v2 includes path, size, isSymlink)
    let manifest = [];
    if (Array.isArray(raw.manifest)) {
        manifest = raw.manifest.map(item => ({
            path: String(item.path || '').replace(/\\/g, '/'),
            size: typeof item.size === 'number' ? item.size : 0,
            isSymlink: Boolean(item.isSymlink),
            target: item.target ? String(item.target).replace(/\\/g, '/') : null
        }));
    } else {
        // Fallback for legacy v1 commits: synthesize manifest entries from files list
        manifest = files.map(filePath => ({
            path: filePath,
            size: 0,
            isSymlink: false,
            target: null
        }));
    }

    return {
        id,
        shortId: id.replace('commit-', '').substring(0, 7),
        version: isV2 ? 2 : 1,
        isLegacy: !isV2,
        parentCommit,
        message,
        timestamp,
        filesCount: files.length,
        files,
        manifest,
        reanchoredFromLegacy: Boolean(raw.reanchoredFromLegacy)
    };
}

/**
 * Transforms a full snapshot manifest into a directory-level tree view DTO.
 * Mimics GitHub's directory navigation by returning immediate child files & folders.
 *
 * @param {Array<object>} manifest - Array of manifest entries from commit metadata.
 * @param {string} [subPath=''] - Current directory path (e.g. 'backend' or 'backend/controllers').
 * @returns {Array<object>} - Sorted array of DirectoryEntryDTO items (folders first, then files).
 */
export function buildTreeDTO(manifest, subPath = '') {
    if (!Array.isArray(manifest)) {
        return [];
    }

    const normalizedSubPath = subPath
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

    const prefix = normalizedSubPath ? `${normalizedSubPath}/` : '';
    const directories = new Map(); // dirName -> { name, type: 'directory', path, count }
    const files = [];

    for (const item of manifest) {
        const itemPath = (item.path || '').replace(/\\/g, '/');
        if (!itemPath) continue;

        // Check if item belongs to the requested subfolder
        if (prefix && !itemPath.startsWith(prefix)) {
            continue;
        }

        const relativeToPrefix = prefix ? itemPath.slice(prefix.length) : itemPath;
        const parts = relativeToPrefix.split('/');

        if (parts.length > 1) {
            // It's inside a subdirectory at this level
            const dirName = parts[0];
            const dirFullPath = prefix ? `${prefix}${dirName}` : dirName;
            if (!directories.has(dirName)) {
                directories.set(dirName, {
                    name: dirName,
                    type: 'directory',
                    path: dirFullPath,
                    itemCount: 1
                });
            } else {
                directories.get(dirName).itemCount += 1;
            }
        } else {
            // It's a file or symlink at this immediate level
            files.push({
                name: parts[0],
                type: item.isSymlink ? 'symlink' : 'file',
                path: itemPath,
                size: typeof item.size === 'number' ? item.size : 0,
                isSymlink: Boolean(item.isSymlink),
                target: item.target || null
            });
        }
    }

    const sortedDirs = Array.from(directories.values()).sort((a, b) => a.name.localeCompare(b.name));
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

    return [...sortedDirs, ...sortedFiles];
}

/**
 * Validates and normalizes a file blob DTO.
 *
 * @param {object} data - Raw blob info.
 * @returns {object} - BlobContentDTO.
 */
export function validateBlobDTO(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Blob data must be a valid object.');
    }
    const filePath = String(data.path || '').replace(/\\/g, '/');
    const content = typeof data.content === 'string' ? data.content : '';
    const size = typeof data.size === 'number' ? data.size : Buffer.byteLength(content, 'utf-8');
    const lines = content.length > 0 ? content.split('\n').length : 0;

    return {
        path: filePath,
        size,
        lines,
        content,
        isBinary: Boolean(data.isBinary)
    };
}

/**
 * Validates a Repository entity contract bridging MongoDB and DVCS storage.
 *
 * @param {object} data
 * @returns {object} - RepositoryDTO.
 */
export function validateRepositoryDTO(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Repository data must be an object.');
    }
    const id = sanitizeRepoId(data.repositoryId || data.id);
    const name = String(data.name || id).trim();
    const visibility = data.visibility === 'private' ? 'private' : 'public';
    const defaultBranch = typeof data.defaultBranch === 'string' ? data.defaultBranch : 'main';

    return {
        id,
        mongoId: data._id ? String(data._id) : null,
        name,
        description: typeof data.description === 'string' ? data.description : '',
        visibility,
        defaultBranch,
        headCommitId: data.headCommitId ? validateCommitId(data.headCommitId) : null,
        localPath: data.localPath || resolveRepoPath(id),
        owner: data.owner ? (typeof data.owner === 'object' ? data.owner : { id: String(data.owner) }) : null,
        storageMode: 'LOCAL_FILESYSTEM',
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
    };
}

/**
 * Validates an Issue entity contract.
 *
 * @param {object} data
 * @returns {object} - IssueDTO.
 */
export function validateIssueDTO(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Issue data must be an object.');
    }
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        throw new Error('Issue title is required.');
    }

    return {
        id: data.id ? String(data.id) : (data._id ? String(data._id) : null),
        title: data.title.trim(),
        description: typeof data.description === 'string' ? data.description : '',
        status: data.status === 'closed' ? 'closed' : 'open',
        repositoryId: sanitizeRepoId(data.repositoryId || data.repoId),
        author: data.author ? (typeof data.author === 'object' ? data.author : { username: String(data.author) }) : null,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
    };
}
