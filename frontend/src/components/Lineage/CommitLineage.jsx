import React, { useState } from 'react';
import {
  IconLineage,
  IconSnapshot,
  IconRevert,
  IconCheck,
  IconUser,
  IconFile
} from '../Common/Icons';

export const CommitLineage = ({ repo, onRevertToCommit, onBrowseSnapshot }) => {
  const [selectedCommitId, setSelectedCommitId] = useState(repo.commits[0]?.id);

  const selectedCommit = repo.commits.find((c) => c.id === selectedCommitId) || repo.commits[0];

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflow: 'hidden'
      }}
    >
      {/* LEFT: Lineage DAG View */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          borderRight: '1px solid var(--border-subtle)',
          overflowY: 'auto'
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Deterministic Commit Lineage (DAG)
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Tracking explicit parentCommit relationships across full-tree snapshots.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-copper">{repo.commits.length} SNAPSHOT COMMITS</span>
            <span className="badge badge-neutral">HEAD: {repo.headCommitId.substring(0, 7)}</span>
          </div>
        </div>

        {/* Commit Graph List */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {repo.commits.map((commit, idx) => {
            const isHead = idx === 0;
            const isSelected = commit.id === selectedCommitId;
            const hasNext = idx < repo.commits.length - 1;

            return (
              <div key={commit.id} style={{ display: 'flex', position: 'relative' }}>
                {/* SVG Column for DAG node & connecting rail */}
                <div
                  style={{
                    width: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0
                  }}
                >
                  {/* Top connector if not first */}
                  <div
                    style={{
                      width: '2px',
                      height: '14px',
                      backgroundColor: idx === 0 ? 'transparent' : 'var(--border-strong)'
                    }}
                  />

                  {/* Commit Node */}
                  <div
                    onClick={() => setSelectedCommitId(commit.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: isSelected
                        ? 'var(--accent-copper)'
                        : isHead
                        ? 'var(--bg-surface-elevated)'
                        : 'var(--bg-surface)',
                      border: isSelected
                        ? '3px solid var(--border-subtle)'
                        : isHead
                        ? '2px solid var(--accent-copper)'
                        : '2px solid var(--border-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isHead && !isSelected && (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-copper)'
                        }}
                      />
                    )}
                  </div>

                  {/* Bottom connector rail */}
                  {hasNext && (
                    <div
                      style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '60px',
                        backgroundColor: 'var(--border-strong)'
                      }}
                    />
                  )}
                </div>

                {/* Commit Entry Body */}
                <div
                  onClick={() => setSelectedCommitId(commit.id)}
                  style={{
                    flex: 1,
                    marginLeft: '12px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                    border: isSelected ? '1px solid var(--accent-copper-border)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-strong)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {/* Row 1: Message & Short Hash */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '13px',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)'
                        }}
                      >
                        {commit.message}
                      </span>
                      {isHead && <span className="badge badge-copper">HEAD</span>}
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: isSelected ? 'var(--accent-copper)' : 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-canvas)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0
                      }}
                    >
                      {commit.shortId}
                    </span>
                  </div>

                  {/* Row 2: Metadata, Author, Lineage Parent */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '8px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <span>{commit.author.split('<')[0].trim()}</span>
                    <span>•</span>
                    <span>{new Date(commit.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>
                      parent:{' '}
                      <span style={{ color: commit.parentCommit ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {commit.parentCommit ? commit.parentCommit.substring(0, 7) : 'root'}
                      </span>
                    </span>
                  </div>

                  {/* Row 3: Changed Files Summary */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    {commit.changes.added.length > 0 && (
                      <span className="badge badge-success">+{commit.changes.added.length} added</span>
                    )}
                    {commit.changes.modified.length > 0 && (
                      <span className="badge badge-neutral">~{commit.changes.modified.length} modified</span>
                    )}
                    {commit.changes.deleted.length > 0 && (
                      <span className="badge badge-error">-{commit.changes.deleted.length} deleted</span>
                    )}
                    <span className="badge badge-neutral">{commit.treeSnapshot.length} in snapshot</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Selected Commit Detail Inspector (360px) */}
      <aside
        style={{
          width: '360px',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          SNAPSHOT MANIFEST // {selectedCommit.shortId}
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Commit Summary */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              MESSAGE
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 500,
                marginTop: '4px',
                lineHeight: 1.4
              }}
            >
              {selectedCommit.message}
            </div>
          </div>

          {/* Explicit Parent Hash Lineage */}
          <div
            style={{
              padding: '10px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                CURRENT COMMIT ID
              </span>
              <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-copper)' }}>
                {selectedCommit.id}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                EXPLICIT PARENT COMMIT
              </span>
              <div
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  color: selectedCommit.parentCommit ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {selectedCommit.parentCommit || '(Initial Root Commit — No Parent)'}
              </div>
            </div>
          </div>

          {/* Full-Tree Snapshot Manifest Files */}
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>SNAPSHOT FILES</span>
              <span>{selectedCommit.treeSnapshot.length} TOTAL</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '6px 0'
              }}
            >
              {selectedCommit.treeSnapshot.map((path, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconFile size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {path}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <button
              onClick={() => onRevertToCommit(selectedCommit)}
              className="btn btn-primary font-mono"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <IconRevert size={13} />
              <span>REVERT TO THIS SNAPSHOT</span>
            </button>

            <button
              onClick={() => onBrowseSnapshot(selectedCommit)}
              className="btn btn-secondary font-mono"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <IconSnapshot size={13} />
              <span>EXPLORE SNAPSHOT CODE TREE</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
