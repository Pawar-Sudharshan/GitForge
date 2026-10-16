import React, { useState } from 'react';
import {
  GitCommitIcon,
  GitBranchIcon,
  CheckIcon,
  CopyIcon,
  CodeIcon,
  PackageIcon
} from '@primer/octicons-react';

export const CommitHistoryView = ({
  repo,
  onBrowseSnapshot,
  onRevertCommit
}) => {
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'dag'
  const [copiedId, setCopiedId] = useState(null);

  const copyHash = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedId(hash);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Subnav: List View vs Dedicated DAG Lineage View */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--gh-border-default)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('list')}
            className={`gh-btn ${activeSubTab === 'list' ? 'gh-btn-primary' : ''}`}
          >
            <GitCommitIcon size={16} />
            <span>Commit History</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dag')}
            className={`gh-btn ${activeSubTab === 'dag' ? 'gh-btn-primary' : ''}`}
          >
            <GitBranchIcon size={16} />
            <span>Parent Commit Lineage (DAG)</span>
          </button>
        </div>

        <div style={{ color: 'var(--gh-fg-muted)', fontSize: '13px' }}>
          Showing <strong>{repo.commits.length}</strong> full-tree snapshots on <strong>{repo.defaultBranch}</strong>
        </div>
      </div>

      {activeSubTab === 'list' ? (
        /* GitHub Standard Commits List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            {/* Date Group Heading */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'var(--gh-fg-muted)',
                marginBottom: '12px'
              }}
            >
              <GitCommitIcon size={16} />
              <span>Commits on Oct 15, 2026</span>
            </div>

            {/* Commits Container Box */}
            <div
              style={{
                border: '1px solid var(--gh-border-default)',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: 'var(--gh-bg-default)'
              }}
            >
              {repo.commits.map((commit, idx) => (
                <div
                  key={commit.id}
                  style={{
                    padding: '12px 16px',
                    borderTop: idx === 0 ? 'none' : '1px solid var(--gh-border-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'background 80ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gh-bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Left: Commit message + Author metadata */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: 'var(--gh-fg-default)'
                        }}
                      >
                        {commit.message}
                      </span>

                      {/* Verified Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          border: '1px solid rgba(46, 160, 67, 0.4)',
                          borderRadius: '2em',
                          padding: '0 6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#3fb950',
                          lineHeight: '16px'
                        }}
                      >
                        <CheckIcon size={12} />
                        Verified
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '6px',
                        fontSize: '12px',
                        color: 'var(--gh-fg-muted)'
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#30363d',
                          color: '#fff',
                          fontSize: '9px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600
                        }}
                      >
                        S
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--gh-fg-default)' }}>
                        {commit.author.split('<')[0].trim()}
                      </span>
                      <span>committed 2 hours ago</span>
                      <span>•</span>
                      <span>
                        parent:{' '}
                        <span className="gh-mono" style={{ color: 'var(--gh-accent)' }}>
                          {commit.parentCommit ? commit.parentCommit.substring(0, 7) : 'none (root)'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Commit Hash pill with copy + Browse code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        border: '1px solid var(--gh-border-default)',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}
                    >
                      <span
                        className="gh-mono"
                        style={{
                          padding: '3px 8px',
                          fontSize: '12px',
                          backgroundColor: 'var(--gh-bg-subtle)',
                          color: 'var(--gh-accent)'
                        }}
                      >
                        {commit.shortId}
                      </span>
                      <button
                        onClick={() => copyHash(commit.id)}
                        className="gh-btn gh-btn-sm"
                        style={{
                          borderRadius: 0,
                          border: 'none',
                          borderLeft: '1px solid var(--gh-border-default)'
                        }}
                        title="Copy full SHA"
                      >
                        {copiedId === commit.id ? (
                          <CheckIcon size={12} style={{ color: '#3fb950' }} />
                        ) : (
                          <CopyIcon size={12} />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => onBrowseSnapshot(commit)}
                      className="gh-btn gh-btn-sm"
                      title="Browse snapshot files at this commit"
                    >
                      <CodeIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Dedicated Parent Commit Lineage DAG View */
        <div
          style={{
            border: '1px solid var(--gh-border-default)',
            borderRadius: '6px',
            backgroundColor: 'var(--gh-bg-default)',
            padding: '24px'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gh-fg-default)' }}>
              ApnaGit Explicit Parent Commit Lineage (DAG)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--gh-fg-muted)', marginTop: '4px' }}>
              Unlike delta-based systems, each commit contains a full-tree content manifest linked by strict
              <code>parentCommit</code> references.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            {repo.commits.map((commit, idx) => {
              const isHead = idx === 0;
              const hasNext = idx < repo.commits.length - 1;

              return (
                <div key={commit.id} style={{ display: 'flex', position: 'relative' }}>
                  {/* Visual Node & Connecting Track */}
                  <div
                    style={{
                      width: '36px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '2px',
                        height: '14px',
                        backgroundColor: idx === 0 ? 'transparent' : 'var(--gh-border-default)'
                      }}
                    />

                    {/* Commit circle node */}
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: isHead ? 'var(--gh-accent)' : 'var(--gh-bg-default)',
                        border: '2px solid var(--gh-accent)',
                        zIndex: 2
                      }}
                    />

                    {hasNext && (
                      <div
                        style={{
                          width: '2px',
                          flex: 1,
                          minHeight: '48px',
                          backgroundColor: 'var(--gh-border-default)'
                        }}
                      />
                    )}
                  </div>

                  {/* Commit details card */}
                  <div
                    style={{
                      flex: 1,
                      marginLeft: '12px',
                      marginBottom: '16px',
                      padding: '12px 16px',
                      border: '1px solid var(--gh-border-default)',
                      borderRadius: '6px',
                      backgroundColor: isHead ? 'var(--gh-bg-subtle)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>
                          {commit.message}
                        </span>
                        {isHead && <span className="gh-counter" style={{ color: 'var(--gh-accent)' }}>HEAD</span>}
                      </div>

                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: 'var(--gh-fg-muted)',
                          display: 'flex',
                          gap: '12px',
                          fontFamily: 'var(--github-font-mono)'
                        }}
                      >
                        <span>commit: <strong>{commit.shortId}</strong></span>
                        <span>parent: <strong>{commit.parentCommit ? commit.parentCommit.substring(0, 7) : 'root'}</strong></span>
                        <span>{commit.treeSnapshot.length} files in snapshot</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onRevertCommit(commit)}
                        className="gh-btn gh-btn-sm"
                        title="Safe revert repository to this snapshot"
                      >
                        Safe Revert
                      </button>
                      <button
                        onClick={() => onBrowseSnapshot(commit)}
                        className="gh-btn gh-btn-sm"
                        title="Browse snapshot files"
                      >
                        <CodeIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
