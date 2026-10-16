import React, { useState } from 'react';
import { IconRepo, IconPlus } from '../Common/Icons';

export const NewRepoModal = ({ isOpen, onClose, onCreateRepo }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [localPath, setLocalPath] = useState('C:\\project2\\storage\\repos\\');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const newRepo = {
      id: `repo-${cleanName}`,
      name: cleanName,
      description: desc.trim() || 'Local sandbox repository.',
      localPath: `${localPath}${cleanName}`,
      visibility: 'private',
      defaultBranch: 'main',
      headCommitId: '10a8b7c3d2e1f0a9b8c7',
      storageMode: 'LOCAL_FILESYSTEM',
      s3SyncStatus: 'DISCONNECTED_NO_CREDENTIALS',
      trackedFilesCount: 2,
      snapshotSizeBytes: 4200,
      lastModified: new Date().toISOString(),
      commits: [
        {
          id: '10a8b7c3d2e1f0a9b8c7',
          shortId: '10a8b7c',
          parentCommit: null,
          message: 'Initial repository baseline snapshot',
          author: 'Sudharshan Pawar <sudharshan@gitforge.local>',
          timestamp: new Date().toISOString(),
          treeSnapshot: ['README.md', 'package.json'],
          changes: { added: ['README.md', 'package.json'], modified: [], deleted: [] }
        }
      ],
      fileTree: [
        {
          name: 'README.md',
          type: 'file',
          path: 'README.md',
          size: '320 B',
          language: 'markdown',
          content: `# ${cleanName}\nInitial repository scaffold created with GitForge.`
        },
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
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 19, 22, 0.8)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 115,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconRepo size={18} style={{ color: 'var(--accent-copper)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Initialize Local Repository
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm font-mono">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              REPOSITORY NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. kv-storage-engine"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-text font-mono"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              DESCRIPTION
            </label>
            <input
              type="text"
              placeholder="e.g. Memory-mapped append-only ledger"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="input-text font-mono"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              FILESYSTEM PATH
            </label>
            <input
              type="text"
              value={localPath + (name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || '')}
              onChange={(e) => setLocalPath(e.target.value)}
              className="input-text font-mono"
              style={{ width: '100%', color: 'var(--text-secondary)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary font-mono">
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary font-mono">
              INITIALIZE REPO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
