import path from "path";
import fs from "fs/promises";

/**
 * Validates that a raw relative path string:
 * 1. Is not an absolute path (leading / or \).
 * 2. Does not contain Windows drive letters (e.g. C:).
 * 3. Does not contain UNC path prefix (// or \\).
 * 4. Does not contain parent directory traversal ('..').
 * 5. Strictly resolves inside the workspace root.
 *
 * @param {string} rawPath - The path provided by CLI or manifest.
 * @param {string} workspaceRoot - The absolute repository root path.
 * @returns {string} - The sanitized, normalized relative path (using POSIX forward slashes).
 */
export function validatePathSafety(rawPath, workspaceRoot) {
    if (typeof rawPath !== "string" || !rawPath.trim()) {
        throw new Error("Path must be a non-empty string.");
    }

    const trimmed = rawPath.trim();

    // 1. Reject absolute paths (do NOT silently strip leading slash)
    if (trimmed.startsWith("/") || trimmed.startsWith("\\")) {
        throw new Error(`Security Violation: Absolute path "${rawPath}" is not permitted.`);
    }

    // 2. Reject Windows drive letters (e.g. C:, D:)
    if (/^[a-zA-Z]:/.test(trimmed)) {
        throw new Error(`Security Violation: Drive-letter path "${rawPath}" is not permitted.`);
    }

    // 3. Reject UNC network paths
    if (trimmed.startsWith("//") || trimmed.startsWith("\\\\")) {
        throw new Error(`Security Violation: UNC network path "${rawPath}" is not permitted.`);
    }

    // 4. Reject traversal segments
    const segments = trimmed.split(/[/\\]+/);
    if (segments.includes("..")) {
        throw new Error(`Security Violation: Path traversal ".." in "${rawPath}" is not permitted.`);
    }

    // 5. Canonical boundary verification
    const normalized = segments.join("/");
    const resolved = path.resolve(workspaceRoot, normalized);
    const expectedPrefix = path.resolve(workspaceRoot) + path.sep;

    if (resolved !== path.resolve(workspaceRoot) && !resolved.startsWith(expectedPrefix)) {
        throw new Error(`Security Violation: Path "${rawPath}" escapes workspace boundary.`);
    }

    return normalized;
}

/**
 * Checks whether a normalized relative path is an excluded secret or system file.
 *
 * Excluded:
 * - .env, .env.local, .env.production, .env.development, .env.staging, .env.test
 * - .env.*.local
 * - *.pem, *.key, id_rsa*
 * - .apnaGit/**, .git/**, node_modules/**
 * - .DS_Store, Thumbs.db
 *
 * Explicitly Permitted:
 * - .env.example, .env.sample, .env.template, .env.defaults, .env.dist
 *
 * @param {string} relativePath - Normalized relative path with forward slashes.
 * @returns {boolean} - True if excluded, false if permitted.
 */
export function isExcluded(relativePath) {
    const norm = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    const baseName = path.basename(norm);
    const lowerBase = baseName.toLowerCase();

    // 1. Explicit whitelist takes precedence
    const templatePatterns = [
        ".env.example",
        ".env.sample",
        ".env.template",
        ".env.defaults",
        ".env.dist"
    ];
    if (templatePatterns.includes(lowerBase)) {
        return false;
    }

    // 2. Exact match secret files
    const exactSecrets = [
        ".env",
        ".env.local",
        ".env.production",
        ".env.development",
        ".env.staging",
        ".env.test"
    ];
    if (exactSecrets.includes(lowerBase)) {
        return true;
    }

    // 3. Dynamic patterns for secrets
    if (/^\.env\..*\.local$/i.test(lowerBase)) {
        return true;
    }
    if (/\.(pem|key|pfx|p12)$/i.test(lowerBase)) {
        return true;
    }
    if (/^id_rsa/i.test(lowerBase)) {
        return true;
    }

    // 4. OS metadata
    if (lowerBase === ".ds_store" || lowerBase === "thumbs.db") {
        return true;
    }

    // 5. System directories
    const parts = norm.split("/");
    if (parts.includes(".apnaGit") || parts.includes(".git") || parts.includes("node_modules")) {
        return true;
    }

    return false;
}

/**
 * Inspects a file path and checks if it's an escaping symbolic link.
 *
 * @param {string} absolutePath - Path to inspect.
 * @param {string} workspaceRoot - Absolute workspace root.
 * @returns {Promise<{ isSymlink: boolean, target?: string }>}
 */
export async function inspectSymlinkSafety(absolutePath, workspaceRoot) {
    try {
        const stat = await fs.lstat(absolutePath);
        if (stat.isSymbolicLink()) {
            const linkTarget = await fs.readlink(absolutePath);
            const resolvedTarget = path.resolve(path.dirname(absolutePath), linkTarget);
            const expectedPrefix = path.resolve(workspaceRoot) + path.sep;

            if (resolvedTarget !== path.resolve(workspaceRoot) && !resolvedTarget.startsWith(expectedPrefix)) {
                throw new Error(`Security Violation: Symlink "${absolutePath}" points outside repository boundary.`);
            }

            const relativeTarget = path.relative(path.dirname(absolutePath), resolvedTarget).replace(/\\/g, "/");
            return { isSymlink: true, target: relativeTarget };
        }
        return { isSymlink: false };
    } catch (err) {
        if (err.message && err.message.startsWith("Security Violation")) {
            throw err;
        }
        return { isSymlink: false };
    }
}

/**
 * Validates a repository ID string for S3 key safe namespacing.
 *
 * @param {string} repoId
 * @returns {string} - Cleaned repoId
 */
export function sanitizeRepoId(repoId) {
    if (typeof repoId !== "string" || !repoId.trim()) {
        throw new Error("Repository ID must be a non-empty string.");
    }
    const trimmed = repoId.trim();
    if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
        throw new Error(`Security Violation: Repository ID "${repoId}" contains invalid characters. Only alphanumeric, dashes, and underscores allowed.`);
    }
    return trimmed;
}
