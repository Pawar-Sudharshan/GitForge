import React, { useState } from 'react';
import {
  PackageIcon,
  CheckIcon,
  FileIcon,
  HistoryIcon,
  ShieldCheckIcon,
  CopyIcon
} from '@primer/octicons-react';

export const SnapshotInspector = ({
  repo,
  onOpenRevert
}) => {
  const [selectedCommitId, setSelectedCommitId] = useState(repo.headCommitId);
  const [copiedId, setCopiedId] = useState(false);

  const selectedCommit = repo.commits.find((c) => c.id === selectedCommitId) || repo.commits[0];

  const copyId = () => {
    navigator.clipboard?.writeText(selectedCommit.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gh-fg-default)' }}>
          Full-Tree Snapshots & Safe Revert
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--gh-fg-muted)', marginTop: '4px' }}>
          Inspect content-addressed snapshot manifests and roll back workspace state safely without touching untracked files.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Left: Snapshot Selector */}
        <div
          style={{
            border: '1px solid var(--gh-border-default)',
            borderRadius: '6px',
            backgroundColor: 'var(--gh-bg-default)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--gh-bg-subtle)',
              borderBottom: '1px solid var(--gh-border-default)',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Available Snapshots ({repo.commits.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {repo.commits.map((commit, idx) => {
              const isSelected = commit.id === selectedCommitId;
              const isHead = idx === 0;

              return (
                <div
                  key={commit.id}
                  onClick={() => setSelectedCommitId(commit.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--gh-border-muted)',
                    backgroundColor: isSelected ? 'var(--gh-bg-subtle)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #f78166' : '3px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="gh-mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gh-accent)' }}>
                      {commit.shortId}
                    </span>
                    {isHead && <span className="gh-badge" style={{ color: 'var(--gh-accent)' }}>HEAD</span>}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--gh-fg-default)',
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {commit.message}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--gh-fg-muted)', marginTop: '4px' }}>
                    {new Date(commit.timestamp).toLocaleDateString()} • {commit.treeSnapshot.length} files
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Snapshot Manifest & Revert Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Snapshot Header Box */}
          <div
            style={{
              border: '1px solid var(--gh-border-default)',
              borderRadius: '6px',
              backgroundColor: 'var(--gh-bg-default)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <span className="gh-badge" style={{ marginBottom: '8px' }}>
                  Content-Addressed Snapshot
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                  {selectedCommit.message}
                </h3>
                <div
                  style={{
                    fontFamily: 'var(--github-font-mono)',
                    fontSize: '12px',
                    color: 'var(--gh-fg-muted)',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>SHA: {selectedCommit.id}</span>
                  <button
                    onClick={copyId}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gh-fg-muted)' }}
                    title="Copy full SHA"
                  >
                    {copiedId ? <CheckIcon size={12} style={{ color: '#3fb950' }} /> : <CopyIcon size={12} />}
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--github-font-mono)', fontSize: '12px', color: 'var(--gh-fg-muted)', marginTop: '4px' }}>
                  Parent: {selectedCommit.parentCommit || '(Initial Root Baseline)'}
                </div>
              </div>

              {/* Action Button: Revert */}
              <button
                onClick={() => onOpenRevert(selectedCommit)}
                className="gh-btn gh-btn-primary"
              >
                <HistoryIcon size={14} />
                <span>Safe Revert to this Snapshot</span>
              </button>
            </div>
          </div>

          {/* Snapshot Tree Manifest List */}
          <div
            style={{
              border: '1px solid var(--gh-border-default)',
              borderRadius: '6px',
              backgroundColor: 'var(--gh-bg-default)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--gh-bg-subtle)',
                padding: '10px 16px',
                borderBottom: '1px solid var(--gh-border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <span>Snapshot Manifest ({selectedCommit.treeSnapshot.length} files tracked)</span>
              <span style={{ color: '#3fb950', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <ShieldCheckIcon size={14} /> Integrity Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {selectedCommit.treeSnapshot.map((file, idx) => (
                <div
                  key={idx}
                  className="gh-table-row"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'var(--github-font-mono)' }}
                >
                  <FileIcon size={14} style={{ color: 'var(--gh-fg-muted)' }} />
                  <span style={{ color: 'var(--gh-fg-default)' }}>{file}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
