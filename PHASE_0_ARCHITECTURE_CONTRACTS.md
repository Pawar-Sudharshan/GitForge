# GitForge Phase 0 — Architecture Contracts, Schemas & Baseline Specification

**Document Version:** 1.0.0 (Phase 0 Baseline)  
**Project Root:** `c:\project2`  
**Status:** Verified & Tested (17/17 Phase 0 Contract Tests Passing)

---

## 1. Configurable Multi-Repository Storage Architecture

### 1.1 `REPOSITORIES_ROOT_DIR` Resolution
Multi-repository isolation is managed via a centralized storage root resolver:

```javascript
const storageRoot = process.env.REPOSITORIES_ROOT_DIR
  ? path.resolve(process.env.REPOSITORIES_ROOT_DIR)
  : path.resolve(process.cwd(), 'storage', 'repositories');
```

- **Safe Default:** `<projectRoot>/backend/storage/repositories/`.
- **Environment Override:** Configurable via `REPOSITORIES_ROOT_DIR` in `.env`.
- **Legacy History Preservation:** The existing developer workspace at `c:\project2\backend\.apnaGit` remains untouched and is **never** automatically moved, modified, or registered.

### 1.2 Multi-Repository Directory Structure
Each repository is allocated an isolated directory identified by its validated `repositoryId`:

```
<REPOSITORIES_ROOT_DIR>/
├── repo-apnagit-core/
│   ├── .apnaGit/
│   │   ├── config.json         # { "repositoryId": "repo-apnagit-core", "version": 2 }
│   │   ├── head.json           # { "currentCommit": "commit-..." }
│   │   ├── index.json          # Staging array
│   │   ├── staging/            # Staging directory
│   │   └── commits/            # Immutable full-tree snapshot directories
│   │       └── commit-<ts>-<hash>/
│   │           ├── commit-metadata.json
│   │           └── <physical snapshot files>
│   └── <working tree files>
└── repo-custom-project/
    ├── .apnaGit/
    └── <working tree files>
```

### 1.3 Entity Identity Mapping Contract
A strict 1:1:1 mapping binds database records, filesystem storage, and S3 remote prefixes:

| Identity Key | System Layer | Format / Example | Constraints |
| :--- | :--- | :--- | :--- |
| **`_id`** | MongoDB | `ObjectId("670f...")` | Database primary key for relations and queries. |
| **`repositoryId`** | DVCS Engine & URLs | `repo-apnagit-core` | 3–64 chars: `^[a-zA-Z0-9_-]{3,64}$`. Unique index. |
| **`name`** | User Interface | `apnaGit-core` | User-defined display name. |
| **`localPath`** | Filesystem | `<REPOSITORIES_ROOT_DIR>/<repositoryId>/` | Guaranteed child of `REPOSITORIES_ROOT_DIR`. |
| **`s3Prefix`** | AWS S3 Bucket | `repositories/<repositoryId>/` | Isolated remote namespace per repository. |

---

## 2. Preserved Phase 2 S3 Remote Key Hierarchy

In accordance with [backend/controllers/push.js](file:///c:/project2/backend/controllers/push.js) and [backend/controllers/pull.js](file:///c:/project2/backend/controllers/pull.js), the S3 key structure is strictly preserved:

| Resource | S3 Key | Method / Purpose |
| :--- | :--- | :--- |
| **Remote HEAD Pointer** | `repositories/<repositoryId>/repo-state/head.json` | Read via `GetObjectCommand`; written via conditional `PutObjectCommand` (`IfMatch`). |
| **Commit Metadata** | `repositories/<repositoryId>/commits/<commitId>/commit-metadata.json` | Manifest, parent linkage, author, and timestamp. |
| **Snapshot File Object** | `repositories/<repositoryId>/commits/<commitId>/<relativePath>` | Content-addressed or path-addressed file payload. |
| **Repository Config** | `repositories/<repositoryId>/config.json` | Optional repository metadata backup. |

---

## 3. DVCS v2 On-Disk Structure & DTO Specifications

### 3.1 Actual DVCS v2 `commit-metadata.json` Schema
Verified from [backend/controllers/commit.js:116-125](file:///c:/project2/backend/controllers/commit.js#L116-L125) and [backend/utils/snapshotEngine.js](file:///c:/project2/backend/utils/snapshotEngine.js):

```json
{
  "version": 2,
  "id": "commit-1792129352938-022771f0",
  "parentCommit": "commit-1792129352800-87b2aac2",
  "message": "feat: verified Phase 2 snapshot engine",
  "timestamp": "2026-10-16T10:00:00.000Z",
  "files": [
    "backend/index.js",
    "package.json"
  ],
  "manifest": [
    {
      "path": "backend/index.js",
      "size": 4323,
      "isSymlink": false
    },
    {
      "path": "package.json",
      "size": 621,
      "isSymlink": false
    }
  ],
  "reanchoredFromLegacy": false
}
```

### 3.2 Legacy v1 Compatibility
Legacy commits (e.g., `commit-1786521399645` found in `.apnaGit/commits`) omit `version`, `parentCommit`, and `manifest`.
- Contract engine normalizes legacy commits to `version: 1`, `isLegacy: true`, `parentCommit: null`, and synthesizes `manifest` from `files`.

### 3.3 Tree Entry DTO (`buildTreeDTO`)
Converts flat manifest arrays into recursive directory navigation items:
```json
[
  {
    "name": "controllers",
    "type": "directory",
    "path": "backend/controllers",
    "itemCount": 5
  },
  {
    "name": "index.js",
    "type": "file",
    "path": "backend/index.js",
    "size": 4323,
    "isSymlink": false,
    "target": null
  }
]
```

### 3.4 File Blob DTO (`validateBlobDTO`)
Represents file content delivered over HTTP:
```json
{
  "path": "backend/index.js",
  "size": 4323,
  "lines": 142,
  "content": "import yargs from 'yargs'...",
  "isBinary": false
}
```

### 3.5 Repository DTO (`validateRepositoryDTO`)
```json
{
  "id": "repo-apnagit-core",
  "mongoId": "670f1a2b3c4d5e6f7a8b9c0d",
  "name": "apnaGit-core",
  "description": "Distributed version control system engine",
  "visibility": "private",
  "defaultBranch": "main",
  "headCommitId": "commit-1792129352938-022771f0",
  "localPath": "C:\\project2\\storage\\repositories\\repo-apnagit-core",
  "owner": {
    "id": "670e1a2b3c4d5e6f7a8b9c00",
    "username": "sudharshan"
  },
  "storageMode": "LOCAL_FILESYSTEM",
  "createdAt": "2026-10-16T10:00:00.000Z"
}
```

### 3.6 Issue DTO (`validateIssueDTO`)
```json
{
  "id": "iss-101",
  "title": "Transactional backup journal during revert",
  "description": "Ensure untracked files are preserved and partial failures restore cleanly.",
  "status": "open",
  "repositoryId": "repo-apnagit-core",
  "author": { "username": "sudharshan" },
  "createdAt": "2026-10-16T10:00:00.000Z"
}
```

---

## 4. Phase 0 Verification & Test Results

The architecture contracts are verified by automated tests in `backend/tests/phase0-contracts.test.js`:
- **Command:** `node --test tests/phase0-contracts.test.js`
- **Output:** 17 tests passed, 0 failed (duration 245ms).
- **Behaviors Verified:**
  1. Default and custom `REPOSITORIES_ROOT_DIR` resolution.
  2. Repository ID sanitization & boundary containment.
  3. Preservation of `repositories/<repoId>/repo-state/head.json` S3 key.
  4. Full DVCS v2 snapshot manifest normalization & legacy v1 fallback.
  5. Directory tree breakdown and alphabetical sorting (directories first).
  6. Repository, Issue, and Blob DTO contracts.
