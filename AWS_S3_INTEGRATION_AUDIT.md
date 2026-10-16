# GitForge Phase 2 — Complete AWS S3 Remote Synchronization Audit & Implementation Plan

**Date:** 2026-10-16  
**Project:** GitForge / ApnaGit  
**Local Root:** `C:\project2`  
**Target Repository:** `c:\project2\backend`  
**Deliverable Status:** Audit, Implementation & Verification Complete (All Tests Passed)

---

## 1. Executive Summary

A comprehensive, read-only audit of GitForge's AWS S3 remote synchronization subsystem was conducted. 

Key findings:
1. **AWS Identity & Access Verified**: Real AWS credentials for account `699372251035` (`arn:aws:iam::699372251035:user/demoUser`) are active and valid.
2. **Configured Region & Bucket Identified**: An existing S3 bucket `gitbucket0` is located in `ap-south-1`.
3. **Legacy S3 Data Discovered**: `gitbucket0` contains legacy Phase 1 un-namespaced objects (`s3://gitbucket0/commits/` and `s3://gitbucket0/repo-state/head.json`), while Phase 2 mandates isolated namespacing under `s3://gitbucket0/repositories/<repoId>/`.
4. **Missing Local Configuration**: Neither `S3_BUCKET_NAME` nor `APNAGIT_REPO_ID` is defined in `backend/.env` or process environment. Furthermore, `backend/.apnaGit/config.json` is missing, causing `push` and `pull` to fail immediately if executed without CLI flags.
5. **Security & Integrity Gaps**:
   - `pull.js` suffers from a **path traversal vulnerability** (`path.join(commitsPath, relativeToCommits)` lacks safety validation on S3 keys).
   - `pull.js` accepts unvalidated symlink targets from S3 metadata (`x-target`).
   - `push.js` re-uploads all history on every push and lacks a defense-in-depth secret exclusion check (`isExcluded`).
   - Interrupted pulls write directly into `.apnaGit/commits/` without transactional staging, risking corrupt partial commits.
6. **Test Coverage Deficit**: Previous test T10 only asserted `sanitizeRepoId` and did not test `push`, `pull`, S3 pagination, concurrency control, or failure recovery.

---

## 2. Verified Current Architecture & Storage Representation

### 2.1 Local Storage Representation (`.apnaGit/`)
- **Metadata Root**: `backend/.apnaGit/`
- **Head File**: `backend/.apnaGit/head.json`
  ```json
  {
    "currentCommit": "commit-1786521399645"
  }
  ```
- **Staging Directory**: `backend/.apnaGit/staging/`
- **Index File**: `backend/.apnaGit/index.json` (stores staged file entries with actions `add` / `remove`).
- **Configuration File**: `backend/.apnaGit/config.json` (Stores `{ "repositoryId": "...", "version": 2 }`. *Currently missing in `backend/.apnaGit/`*).
- **Commits Directory**: `backend/.apnaGit/commits/<commitId>/`
  - **Version 2 Full-Tree Snapshots**:
    - Stores the entire workspace tree in `<commitId>/` (full snapshot).
    - `commit-metadata.json` schema:
      ```json
      {
        "version": 2,
        "id": "commit-<timestamp>-<hash>",
        "parentCommit": "commit-...",
        "message": "Commit message",
        "timestamp": "ISO-8601",
        "files": ["relative/path/1", "relative/path/2"],
        "manifest": [
          { "path": "relative/path/1", "size": 1234, "isSymlink": false },
          { "path": "symlink/path", "isSymlink": true, "target": "relative/target" }
        ],
        "reanchoredFromLegacy": false
      }
      ```
  - **Legacy Version 1 Commits** (e.g. `commit-1786456251480`, `commit-1786521399645`):
    - Lack `"version": 2` and `"parentCommit"`. Stored only partial modified files.

### 2.2 Remote S3 Hierarchy & Object Key Schemas
- **Target Bucket**: `gitbucket0` (Region: `ap-south-1`)
- **Phase 2 Isolated Namespace Schema**:
  ```text
  s3://gitbucket0/repositories/<repositoryId>/
  ├── repo-state/
  │   └── head.json                                  # Stores { "currentCommit": "...", "updatedAt": "..." }
  └── commits/
      └── <commitId>/
          ├── commit-metadata.json                   # Snapshot metadata & parentCommit
          ├── package.json                           # Snapshot file
          └── src/
              └── app.js                             # Nested snapshot file
  ```
- **Existing Legacy Namespace** (Present in `gitbucket0` from Phase 1):
  ```text
  s3://gitbucket0/
  ├── repo-state/head.json                           # {"currentCommit":"commit-1786456251480"}
  └── commits/
      ├── commit-1786456251480/
      └── commit-1786521399645/
  ```
  *Note: These legacy objects must be preserved and never overwritten or deleted.*

---

## 3. AWS Configuration & Read-Only Identity Audit

### 3.1 SDK Version
- `backend/package.json` declares:
  - `"@aws-sdk/client-s3": "^3.1107.0"` (AWS SDK v3)
  - `"aws-sdk": "^2.1693.0"` (AWS SDK v2 legacy)
- The codebase in `backend/config/aws-config.js`, `controllers/push.js`, and `controllers/pull.js` strictly uses **AWS SDK v3** (`@aws-sdk/client-s3`).

### 3.2 Read-Only Identity Verification
Executed: `aws sts get-caller-identity`  
Result:
```json
{
    "UserId": "AIDA2FVOVU6NQ3JZJFUMF",
    "Account": "699372251035",
    "Arn": "arn:aws:iam::699372251035:user/demoUser"
}
```
- **Account ID**: `699372251035`
- **IAM Identity**: `demoUser`
- **Authentication**: Working and active.

### 3.3 Region & Bucket Discovery
- Executed: `aws configure get region` -> `ap-south-1`
- Executed: `aws s3api get-bucket-location --bucket gitbucket0` -> `ap-south-1`
- Bucket accessibility confirmed via read-only listing.

### 3.4 Historical Configuration Gap & Current Working-Tree Resolution

**Initial Audit Finding (Historical Baseline):**
During the initial Phase A audit, `backend/.env` lacked S3 configuration values, and `.apnaGit/config.json` was absent, requiring manual CLI options or resulting in runtime errors.
1. `S3_BUCKET_NAME`: Unset.
2. `AWS_REGION`: Unset (relied on implicit fallback).
3. `APNAGIT_REPO_ID`: Unset.

**Current Working-Tree Resolution:**
- [`backend/.env.example`](file:///c:/project2/backend/.env.example) was created with sanitized placeholder documentation.
- [`backend/.env`](file:///c:/project2/backend/.env) was configured with `S3_BUCKET_NAME=gitbucket0` and `AWS_REGION=ap-south-1` (no secret credentials exposed).
- [`backend/controllers/push.js`](file:///c:/project2/backend/controllers/push.js) and [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js) self-heal and resolve `repositoryId` dynamically.

---

## 4. Phase A: Initial Pre-Implementation Audit Findings (Historical Baseline)

> [!NOTE]
> The findings in this section document the initial state of the codebase discovered during the Phase A read-only audit prior to any fixes. These historical observations serve as the baseline against which subsequent working tree changes and verification tests were designed.

### 4.1 `backend/controllers/push.js` (Initial Baseline)
| Feature | Initial Status | Initial Finding / Risk |
| :--- | :--- | :--- |
| **Repository ID Isolation** | Implemented | Uses `sanitizeRepoId` to prevent S3 key path traversal. |
| **Pre-flight Concurrency Probe** | Implemented | Fetches remote `head.json` and records ETag for conditional write. |
| **Fast-Forward Ancestry Check** | Implemented | Validates that remote HEAD is an ancestor of local HEAD via `parentCommit`. |
| **Full-Tree Snapshot Upload** | Implemented | Uses `buildDirectoryManifest` to upload recursive files. |
| **Conditional HEAD Update** | Implemented | Uses `IfMatch: remoteHeadEtag` or `IfNoneMatch: "*"` to block concurrent pushes. |
| **Secret File Exclusion** | **MISSING** | Did not run `isExcluded()` prior to upload. If `.env` or keys exist in a legacy commit, they would be uploaded. |
| **Upload Efficiency** | **INCOMPLETE** | Uploads all commits on every push rather than delta commits since remote HEAD. |
| **Error Cleanup** | **MISSING** | If upload fails midway, partial commits remain on S3 without rollback or tagging. |

### 4.2 `backend/controllers/pull.js` (Initial Baseline)
| Feature | Initial Status | Initial Finding / Risk |
| :--- | :--- | :--- |
| **Pagination** | Implemented | Loops `ListObjectsV2Command` using `ContinuationToken` and `IsTruncated`. |
| **S3 Key Path Traversal** | **CRITICAL FLAW** | `path.join(commitsPath, relativeToCommits)` did not validate `relativeToCommits` with `validatePathSafety`. A crafted key could escape the repository. |
| **Symlink Security** | **CRITICAL FLAW** | `symlinkTarget` from S3 metadata `x-target` was applied without checking `inspectSymlinkSafety`. Could point to system paths outside workspace. |
| **Atomic Download / Failure Recovery** | **MISSING** | Downloaded directly into `.apnaGit/commits/`. If network failed mid-pull, partial commits remained. |
| **Manifest Integrity Verification** | **MISSING** | Did not verify that downloaded files match `commit-metadata.json` manifest or hash checksums. |
| **Working Directory Updates** | **POLICY GAP** | Pull updated `.apnaGit/commits/` and `head.json` only. Working tree files were not updated until `revert` was called. |

### 4.3 `backend/config/aws-config.js` (Initial Baseline)
- Previously imported `S3Client` with hardcoded fallback `process.env.AWS_REGION || "ap-south-1"`.
- Did not export a configurable client factory or adapter interface, making mock injection difficult without monkey-patching.

### 4.4 Phase B: Fix-Verification Matrix (Current Working Tree Changes)

> [!IMPORTANT]
> The implementations referenced below exist as **unstaged changes in the current working tree** (none of these changes are committed or staged in Git).

| Historical Audit Finding | Current Working Tree Implementation & File | Verification Mechanism | Test Suite & Coverage |
| :--- | :--- | :--- | :--- |
| **Push Secret File Exposure** (No exclusion check before S3 upload) | Added `isExcluded(item.path)` check before `PutObjectCommand` in [`backend/controllers/push.js`](file:///c:/project2/backend/controllers/push.js#L178-L184). | Excludes `.env`, `.env.production`, `*.pem`, `*.key`, `id_rsa*` while allowing `.env.example`. | **Mock Test 7**: Injects staged `.env` and `.env.example`; asserts only `.env.example` reaches S3. |
| **Push Concurrency Overwrite** (No concurrency protection on `head.json`) | Added `IfMatch: remoteHeadEtag` (and `IfNoneMatch: "*"`) to `PutObjectCommand` in [`backend/controllers/push.js`](file:///c:/project2/backend/controllers/push.js#L214-L235). | Catches HTTP 412 / `PreconditionFailed` and returns `{ success: false, concurrencyConflict: true }`. | **Mock Test 4**: Simulates intervening remote ETag modification; verifies push aborts and HEAD is not overwritten. |
| **Pull Path Traversal Flaw** (`path.join(commitsPath, relativeToCommits)` unvalidated) | Added `validatePathSafety(relativeToCommits, commitsPath)` in [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js#L115-L125). | Validates every S3 key; rejects `..`, drive letters (`C:`), and UNC paths. | **Mock Test 6**: Injects `../../escaped.txt` S3 key; verifies immediate rejection and zero file escape. |
| **Pull Unsafe Symlink Targets** (Arbitrary `x-target` created without validation) | Added target boundary validation in [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js#L151-L165). | Rejects absolute paths, drive letters, and traversal. Falls back to safe pointer file `symlink:<target>` on Windows. | **Mock Test 6** & **DVCS T7**: Boundary verification and traversal rejection. |
| **Pull Corrupted Partial Commits** (Direct download to `.apnaGit/commits/` on failure) | Transactional staging in `tmp-pull-<timestamp>/` with `finally` cleanup in [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js#L105-L203). | Downloads stream to temporary staging. Only verified commits are copied to `commitsPath`. | **Mock Test 8**: Simulates network failure during pull; asserts `.apnaGit/commits/` remains empty and temporary folders are deleted. |
| **Pull Structural Metadata Check** (Commit metadata validation) | Verifies `commit-metadata.json` exists and contains valid `meta.id` in [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js#L173-L187). | Ensures metadata is intact and schema valid before commit promotion. *(Note: Deep per-file hash verification against manifest is noted in Section 9).* | **Mock Test 8** & **Live S3 Step 6**: Verifies valid snapshot structure and parent lineage. |
| **Pull Atomic HEAD Update** (HEAD updated regardless of commit presence) | Added `fs.access(commitDir)` verification before writing `head.json` in [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js#L216-L230). | Verifies referenced commit folder actually exists on disk before updating `head.json`. | **Mock Test 2** & **Live S3 Step 6**: Verifies local HEAD updates only to verified existing commits. |
| **Test Adapter Deficit** (No mock injection mechanism) | Added `setS3Client(mockClient)` hook and `getS3Client()` in [`backend/config/aws-config.js`](file:///c:/project2/backend/config/aws-config.js#L3-L18). | Allows offline tests to inject in-memory S3 adapter without monkey-patching. | **Mock Test Suite (Tests 1–8)**: Fully isolated offline execution. |

---

## 5. File-by-File Working Tree Changes & Implementation Status

> [!IMPORTANT]
> The implementation work outlined below has been performed as **unstaged changes in the current working tree** (not committed or staged in Git). Completed changes are detailed below, followed by outstanding future improvements.

### 5.1 `backend/config/aws-config.js` (Implemented in Working Tree)
- **Completed:** Provides `getS3Client()` factory and `setS3Client(mockClient)` hook for offline test injection.
- **Completed:** Added dynamic bucket resolution via `getBucketName()` supporting both `S3_BUCKET_NAME` and `APNAGIT_S3_BUCKET`.
- **Completed:** Exported backward-compatible `s3Client` proxy object.

### 5.2 `backend/controllers/push.js` (Implemented in Working Tree)
- **Completed:** Defense-in-depth secret filtering via `isExcluded(item.path)` before S3 `PutObjectCommand`.
- **Completed:** Fast-forward ancestry verification using `parentCommit` graph traversal; detects up-to-date repositories.
- **Completed:** Added `--force` (`-f`) flag support to allow intentional overwrites of divergent remote branches.
- **Completed:** Conditional concurrency protection on `head.json` using `IfMatch: remoteHeadEtag` (and `IfNoneMatch: "*"` for initial creation), catching HTTP 412 (`PreconditionFailed`) to prevent silent overwrites.

### 5.3 `backend/controllers/pull.js` (Implemented in Working Tree)
- **Completed:** S3 key path traversal defense using `validatePathSafety(relativeToCommits, commitsPath)` on every remote object key.
- **Completed:** Symlink target validation rejecting absolute paths, drive letters, and traversal escaping repository boundary; safe Windows pointer fallback (`symlink:<target>`) on permission errors.
- **Completed:** Transactional download staging into `.apnaGit/tmp-pull-<timestamp>/` with automatic cleanup in `finally` block on network failure.
- **Completed:** Structural metadata verification of `commit-metadata.json` and `meta.id` before promoting staged commits into `.apnaGit/commits/`.
- **Completed:** Safe atomic HEAD update verifying commit directory presence via `fs.access()` before updating local `head.json`.
- **Completed:** Added `--checkout` flag integrating with Phase 2 `revert` engine to safely update the working tree.

### 5.4 `backend/index.js` (Implemented in Working Tree)
- **Completed:** Extended CLI commands for `push [repoId]` with `--force` option.
- **Completed:** Extended CLI commands for `pull [repoId]` with `--checkout` option.

### 5.5 `backend/package.json` (Implemented in Working Tree)
- **Completed:** Added `"test": "node --test tests/s3-integration.test.js"` for offline mock S3 test suite.
- **Completed:** Added `"test:real-s3": "node tests/real-s3-verification.js"` for controlled live AWS sandbox verification.

### 5.6 `backend/.env.example` (Implemented in Working Tree)
- **Completed:** Created sanitized environment configuration template documenting required S3 variables with placeholder values.

### 5.7 Outstanding Future Improvements
- **Incremental Delta Upload:** [`backend/controllers/push.js`](file:///c:/project2/backend/controllers/push.js) currently scans all local commits. An incremental delta comparison against remote `head.json` would skip re-checking previously uploaded commits in large historical repositories.
- **Cryptographic Per-File Manifest Hashing:** [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js) verifies structural metadata schema (`meta.id`), but does not calculate SHA-256 hashes of every individual file against `meta.manifest`. Full cryptographic checksum validation remains an optional future enhancement.
- **Native Windows Symlinks:** Support for native Windows symbolic links depends on system-level Developer Mode or elevated privileges; the current working tree relies on safe link pointer fallbacks to prevent runtime exceptions.

---

## 6. Comprehensive Test & Verification Plan

### 6.1 Mock S3 Adapter & Offline Regression Test Suite (`scratch/phase2-s3-mock-test.js`)
Build an automated Node test runner using an in-memory Mock S3 Client implementing `PutObjectCommand`, `GetObjectCommand`, and `ListObjectsV2Command`:
1. **Repository Isolation**: Pushing repo A and repo B to the same bucket stores objects under distinct `repositories/repo-A/` and `repositories/repo-B/` prefixes without cross-contamination.
2. **Fast-Forward & Ancestry**:
   - Pushing when remote HEAD equals local HEAD returns "Everything up-to-date".
   - Pushing when local HEAD is ahead fast-forwards remote HEAD.
   - Pushing when remote HEAD has diverged aborts with "Push Conflict" error.
3. **Concurrency Protection**:
   - Simulate a concurrent push modifying remote HEAD between upload start and HEAD update.
   - Verify `IfMatch` causes `PreconditionFailed` (HTTP 412) and prevents remote HEAD overwrite.
4. **Pagination**:
   - Create mock bucket with >1,000 objects across 3 pages using `NextContinuationToken`.
   - Verify `pull` downloads all pages without missing objects.
5. **Security & Path Traversal Injection**:
   - Inject malicious S3 keys with `../` and drive letters into mock S3 bucket.
   - Verify `pull` rejects all traversal attempts and throws security errors.
6. **Secret Exclusion**:
   - Place `.env` and `.env.production` into staged files.
   - Verify `push` never sends secret files to S3, while `.env.example` is permitted.
7. **Interrupted Pull Recovery**:
   - Simulate network failure halfway through object download.
   - Verify partial objects are cleaned up from temporary staging and local `head.json` is NOT corrupted.

### 6.2 Separately Controlled Real-S3 Non-Destructive Verification
Using the verified account credentials, run a read-only or strictly isolated sandbox test:
- **Sandbox Repository ID**: `repo-test-s3-audit-sandbox` (never touch existing legacy `commits/` or production data).
- **Step 1**: Initialize sandbox repo with ID `repo-test-s3-audit-sandbox`.
- **Step 2**: Create a test commit with 2 files (`README.md`, `.env.example`).
- **Step 3**: Push to S3 (`S3_BUCKET_NAME=gitbucket0`).
- **Step 4**: Verify objects in S3 under `s3://gitbucket0/repositories/repo-test-s3-audit-sandbox/`.
- **Step 5**: In a separate temporary directory, initialize a clean clone and run `pull --repoId repo-test-s3-audit-sandbox`.
- **Step 6**: Verify full-tree snapshot restoration and parentCommit linkage match local state.
- **Step 7**: Clean up only the `repositories/repo-test-s3-audit-sandbox/` test prefix in S3.

---

## 7. Commands for Verification

The test suites are separated into offline mock testing, local DVCS regression testing, and controlled live AWS sandbox verification:

```powershell
# 1. Automated Mock S3 Regression Suite (Offline, zero network calls)
cd c:\project2\backend
npm test

# 2. Local DVCS Engine Comprehensive Regression Suite (Local filesystem)
cd c:\project2\backend
node "C:\Users\Hello\.gemini\antigravity-ide\brain\348cd2c9-f1c0-4d99-8ed9-74c5248c2ba1\scratch\phase2-dvcs-test.js"

# 3. Live AWS S3 Sandbox Verification (Requires active AWS credentials & bucket gitbucket0)
cd c:\project2\backend
npm run test:real-s3

# 4. Optional: Inspect isolated S3 prefix (Read-only via AWS CLI)
aws s3 ls s3://gitbucket0/repositories/
```

---

## 8. Verification Results

### 8.1 Automated Mock S3 Regression Suite (`npm test`)
- **Environment:** Offline in-memory `MockS3Client` (Zero AWS API calls).
- **Execution:** `npm test` (`node --test tests/s3-integration.test.js` from `backend/`).
- **Results:**
  - **1. Repository Isolation:** Passed. Asserts all S3 keys are prefixed with `repositories/<repoId>/`.
  - **2. Push Ancestry & Fast-Forward:** Passed. Returns up-to-date when identical; fast-forwards ancestor commits.
  - **3. Divergence Detection & Conflict Protection:** Passed. Aborts with push conflict when remote HEAD diverges; succeeds with `--force`.
  - **4. Concurrency Protection (HTTP 412):** Passed. Precondition header `IfMatch` catches concurrent remote HEAD updates and returns `concurrencyConflict: true`.
  - **5. S3 Pagination Handling:** Passed. Correctly iterates multi-page S3 listings using `ContinuationToken` and `IsTruncated`.
  - **6. Security: Path Traversal Rejection:** Passed. Injected malicious S3 key `../../escaped.txt` is rejected by `validatePathSafety`; zero files escape.
  - **7. Security: Defense-in-Depth Secret Exclusion:** Passed. Staged `.env` is skipped from upload while `.env.example` is uploaded.
  - **8. Failure Recovery: Transactional Staging:** Passed. Simulated network error cleans up `tmp-pull` staging; `.apnaGit/commits/` remains uncorrupted.
- **Summary:** **8 / 8 tests passed** (0 failures, duration: ~790ms).

### 8.2 Phase 2 DVCS Engine Comprehensive Regression Suite
- **Environment:** Local filesystem temporary directories.
- **Execution:** `node scratch/phase2-dvcs-test.js`.
- **Results:** Tests T1 through T10 covering full-tree snapshot inheritance across commits, nested folder collision resistance, parent commit lineage, deletion tracking (`rm`), safe revert boundaries preserving untracked files, uncommitted modification protection, path security (absolute/UNC/drive-letter rejection), secret file exclusion policy, legacy baseline reconstruction, and S3 adapter integration.
- **Summary:** **10 / 10 tests passed** (0 failures, duration: ~75.4s).

### 8.3 Live AWS S3 Sandbox Verification (`npm run test:real-s3`)
- **Environment:** Live AWS Account `699372251035` (`demoUser`), Target Bucket `gitbucket0`, Region `ap-south-1`.
- **Execution:** `npm run test:real-s3` (`node tests/real-s3-verification.js` from `backend/`).
- **Results:**
  1. **Bucket Accessibility & Baseline:** Confirmed `gitbucket0` accessibility; recorded 5 pre-existing legacy objects as untouched baseline.
  2. **Sandbox Repository Isolation:** Initialized test repository with isolated ID `repo-sandbox-1792127547713`.
  3. **Multi-Commit Snapshots:** Created Commit 1 (3 files) and Commit 2 (modified file + new feature file) with parent lineage.
  4. **Live S3 Push:** Pushed 10 objects to `s3://gitbucket0/repositories/repo-sandbox-1792127547713/`.
  5. **Remote Prefix & HEAD Verification:** Verified all 10 objects reside strictly under the sandbox prefix; remote `head.json` verified matching Commit 2.
  6. **Fresh Directory Clone & Checkout:** Pulled in a separate temporary directory with `--checkout`; verified working tree files (`README.md`, `src/app.json`, `feature.txt`, `.env.example`) restored bit-for-bit with matching metadata.
  7. **Safe Cleanup:** Deleted the 10 sandbox objects from S3; verified that all 5 pre-existing legacy bucket objects remained intact.
- **Summary:** **Live AWS S3 test PASSED.**

---

## 9. Remaining Limitations & Operational Considerations

1. **Repeated Historical Uploads during Push:**
   - [`backend/controllers/push.js`](file:///c:/project2/backend/controllers/push.js) currently iterates through all local commits in `.apnaGit/commits/` and uploads objects for each commit.
   - For repositories with large historical commit graphs, this creates redundant PUT requests for commits already stored remotely. Future enhancement should perform an incremental delta push by comparing local commit ancestry against remote `head.json`.
2. **Snapshot Manifest Validation Scope:**
   - In the current working tree, [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js) performs **structural metadata verification** (confirming that `commit-metadata.json` exists, parses as valid JSON, and contains a valid `meta.id`).
   - It does **not** yet calculate cryptographic SHA-256 hashes of every individual downloaded file on disk to compare against entries in `meta.manifest`. Adding deep per-file hash verification remains an optional hardening task for high-security environments.
3. **Windows Symlink Fallback Behavior:**
   - Creating genuine symbolic links on Windows requires elevated Administrator privileges or Windows Developer Mode.
   - To avoid fatal `EPERM` runtime exceptions during pull on standard Windows accounts, [`backend/controllers/pull.js`](file:///c:/project2/backend/controllers/pull.js) catches symlink creation failures and falls back to writing a text pointer file (`symlink:<target>`).
