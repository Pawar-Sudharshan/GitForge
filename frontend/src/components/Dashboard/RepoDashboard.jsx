import React, { useState } from 'react';
import {
  IconRepo,
  IconSnapshot,
  IconLineage,
  IconRevert,
  IconSearch,
  IconPlus,
  IconOffline,
  IconCheck,
  IconTerminal
} from '../Common/Icons';

export const RepoDashboard = ({
  repositories,
  onSelectRepo,
  onViewChange,
  onCreateNewRepo
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRepos = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.localPath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflowY: 'auto',
        padding: '24px 32px'
      }}
    >
      {/* Top Banner: Local-First Engineering Workbench Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Engineering Repositories
            </h1>
            <span className="badge badge-copper">LOCAL_WORKSPACE</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '640px' }}>
            Local-first distributed version control workbench. Full-tree snapshots, deterministic parent lineage,
            and atomic reversions stored directly on disk.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onCreateNewRepo?.()}
            className="btn btn-primary font-mono"
            title="Create new repository sandbox"
          >
            <IconPlus size={13} />
            <span>NEW REPOSITORY</span>
          </button>
        </div>
      </div>

      {/* Operational Stats Grid (Realistic DVCS metrics, NO fake marketing charts!) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px'
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            ACTIVE REPOSITORIES
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {repositories.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            100% Local-first sandboxed
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px'
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            TOTAL SNAPSHOTS RECORDED
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {repositories.reduce((acc, r) => acc + r.commits.length, 0)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            Content-addressed trees
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px'
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            STORAGE FOOTPRINT
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-copper)', marginTop: '4px' }}>
            {(repositories.reduce((acc, r) => acc + r.snapshotSizeBytes, 0) / 1024).toFixed(1)} KB
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            Stored in .apnaGit/commits
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px'
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            AWS S3 SYNCHRONIZATION
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span className="badge badge-local">
              <IconOffline size={11} />
              <span>OFFLINE FALLBACK</span>
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            No remote credentials required
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <IconSearch
            size={13}
            style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Filter repositories by name, path, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-text font-mono"
            style={{ width: '100%', paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* Repositories List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredRepos.map((repo) => {
          const headCommit = repo.commits[0];
          return (
            <div
              key={repo.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {/* Left Details */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    onClick={() => {
                      onSelectRepo(repo);
                      onViewChange('explorer');
                    }}
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {repo.name}
                  </span>
                  <span className="badge badge-neutral">{repo.defaultBranch}</span>
                  <span className="badge badge-copper">HEAD: {repo.headCommitId.substring(0, 7)}</span>
                  <span className="badge badge-neutral">{repo.trackedFilesCount} files</span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                  {repo.description}
                </p>

                {/* Path & Latest Commit */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginTop: '8px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap'
                  }}
                >
                  <span>path: {repo.localPath}</span>
                  <span>•</span>
                  <span>
                    latest commit:{' '}
                    <span style={{ color: 'var(--text-primary)' }}>"{headCommit?.message}"</span>
                  </span>
                  <span>•</span>
                  <span>{new Date(repo.lastModified).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Right Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    onSelectRepo(repo);
                    onViewChange('explorer');
                  }}
                  className="btn btn-secondary btn-sm font-mono"
                  title="Open in Signature 3-Pane Explorer"
                >
                  <IconSnapshot size={12} />
                  <span>EXPLORE CODE</span>
                </button>

                <button
                  onClick={() => {
                    onSelectRepo(repo);
                    onViewChange('lineage');
                  }}
                  className="btn btn-ghost btn-sm font-mono"
                  title="View Commit DAG Lineage"
                >
                  <IconLineage size={12} />
                  <span>LINEAGE</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredRepos.length === 0 && (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)'
            }}
          >
            No repositories match your filter query.
          </div>
        )}
      </div>

      {/* System Engine Status Footer */}
      <div
        style={{
          marginTop: '32px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconCheck size={12} /> DVCS ENGINE ACTIVE (v0.2.0)
          </span>
          <span>•</span>
          <span>SAFE REVERT: ATOMIC</span>
          <span>•</span>
          <span>PATH TRAVERSAL DEFENSE: ENABLED</span>
        </div>
        <div>
          <span>STORAGE ENGINE: LOCAL_DISK_MANIFEST</span>
        </div>
      </div>
    </div>
  );
};
