import React, { useState } from 'react';
import { RepoIcon, LockIcon } from '@primer/octicons-react';

export const NewRepoDialog = ({
  isOpen,
  onClose,
  onCreateRepo
}) => {
  const [repoName, setRepoName] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [initReadme, setInitReadme] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    const cleanName = repoName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const newRepo = {
      id: `repo-${cleanName}`,
      name: cleanName,
      description: desc.trim() || 'A new repository created on GitForge.',
      localPath: `C:\\project2\\storage\\repos\\${cleanName}`,
      visibility,
      defaultBranch: 'main',
      headCommitId: '10a8b7c3d2e1f0a9b8c7',
      storageMode: 'LOCAL_FILESYSTEM',
      s3SyncStatus: 'DISCONNECTED_NO_CREDENTIALS',
      trackedFilesCount: initReadme ? 2 : 1,
      snapshotSizeBytes: 4200,
      lastModified: new Date().toISOString(),
      commits: [
        {
          id: '10a8b7c3d2e1f0a9b8c7',
          shortId: '10a8b7c',
          parentCommit: null,
          message: 'Initial commit',
          author: 'Sudharshan Pawar <sudharshan@gitforge.local>',
          timestamp: new Date().toISOString(),
          treeSnapshot: initReadme ? ['README.md', 'package.json'] : ['package.json'],
          changes: { added: ['README.md', 'package.json'], modified: [], deleted: [] }
        }
      ],
      fileTree: [
        ...(initReadme
          ? [
              {
                name: 'README.md',
                type: 'file',
                path: 'README.md',
                size: '320 B',
                language: 'markdown',
                content: `# ${cleanName}\n${desc.trim() || 'Created with GitForge.'}`
              }
            ]
          : []),
        {
          name: 'package.json',
          type: 'file',
          path: 'package.json',
          size: '140 B',
          language: 'json',
          content: `{\n  "name": "${cleanName}",\n  "version": "0.1.0"\n}`
        }
      ]
    };

    onCreateRepo(newRepo);
    setRepoName('');
    setDesc('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(1, 4, 9, 0.75)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 350,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          backgroundColor: 'var(--gh-bg-default)',
          border: '1px solid var(--gh-border-default)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(1,4,9,0.3)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--gh-bg-subtle)',
            padding: '16px 20px',
            borderBottom: '1px solid var(--gh-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Create a new repository</h2>
            <p style={{ fontSize: '12px', color: 'var(--gh-fg-muted)', marginTop: '2px' }}>
              A repository contains all project files, including the revision history.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--gh-fg-muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Owner & Repository Name */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ width: '160px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Owner
              </label>
              <div
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--gh-bg-subtle)',
                  border: '1px solid var(--gh-border-default)',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                sudharshan
              </div>
            </div>

            <div style={{ fontSize: '20px', color: 'var(--gh-fg-muted)', paddingBottom: '4px' }}>
              /
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Repository name *
              </label>
              <input
                type="text"
                required
                placeholder="my-dvcs-repo"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--gh-border-default)',
                  backgroundColor: 'var(--gh-bg-subtle)',
                  color: 'var(--gh-fg-default)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Description <span style={{ fontWeight: 400, color: 'var(--gh-fg-muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Short description of your repository"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1px solid var(--gh-border-default)',
                backgroundColor: 'var(--gh-bg-subtle)',
                color: 'var(--gh-fg-default)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Visibility Radios */}
          <div style={{ borderTop: '1px solid var(--gh-border-muted)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                style={{ marginTop: '3px', accentColor: 'var(--gh-accent)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px' }}>
                  <RepoIcon size={16} />
                  <span>Public</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gh-fg-muted)', marginTop: '2px' }}>
                  Anyone on the internet can see this repository. You choose who can commit.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                style={{ marginTop: '3px', accentColor: 'var(--gh-accent)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px' }}>
                  <LockIcon size={16} />
                  <span>Private</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gh-fg-muted)', marginTop: '2px' }}>
                  You choose who can see and commit to this repository.
                </div>
              </div>
            </label>
          </div>

          {/* Initialize with README */}
          <div style={{ borderTop: '1px solid var(--gh-border-muted)', paddingTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={initReadme}
                onChange={(e) => setInitReadme(e.target.checked)}
                style={{ accentColor: 'var(--gh-accent)' }}
              />
              <span>Add a README file</span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--gh-border-muted)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="gh-btn">
              Cancel
            </button>
            <button type="submit" className="gh-btn gh-btn-primary">
              Create repository
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
