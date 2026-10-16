import React, { useState } from 'react';
import { IconIssue, IconCheck, IconPlus, IconSearch, IconUser } from '../Common/Icons';

export const IssueTracker = ({ issues, onCreateIssue }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('dvcs-engine');

  const filteredIssues = issues.filter((iss) => {
    if (filterStatus === 'open') return iss.status === 'open';
    if (filterStatus === 'closed') return iss.status === 'closed';
    return true;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateIssue({
      id: `iss-${Date.now().toString().slice(-4)}`,
      repoId: 'repo-apnagit-core',
      title: newTitle.trim(),
      description: newDesc.trim() || 'No description provided.',
      status: 'open',
      author: 'sudharshan',
      createdAt: new Date().toISOString(),
      tag: newTag,
      commentsCount: 0
    });

    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

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
      {/* Main Issue List */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          borderRight: selectedIssue ? '1px solid var(--border-subtle)' : 'none',
          overflowY: 'auto'
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              DVCS Engine Issues & Audits
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Tracked defects, S3 synchronization fallbacks, and security invariants.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-primary font-mono btn-sm"
            >
              <IconPlus size={12} />
              <span>NEW ISSUE</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>STATUS:</span>
          {['all', 'open', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: filterStatus === status ? 'var(--accent-copper)' : 'var(--text-secondary)',
                fontWeight: filterStatus === status ? 700 : 400,
                textTransform: 'uppercase',
                fontSize: '11px'
              }}
            >
              {status} ({issues.filter((i) => status === 'all' || i.status === status).length})
            </button>
          ))}
        </div>

        {/* Issue Cards */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredIssues.map((issue) => {
            const isOpen = issue.status === 'open';
            const isSelected = selectedIssue?.id === issue.id;

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                style={{
                  padding: '14px 16px',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--accent-copper-border)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ marginTop: '2px', color: isOpen ? 'var(--accent-copper)' : 'var(--color-success)' }}>
                    {isOpen ? <IconIssue size={16} /> : <IconCheck size={16} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {issue.title}
                      </span>
                      <span className="badge badge-neutral">{issue.tag}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '6px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span>#{issue.id}</span>
                      <span>•</span>
                      <span>opened by {issue.author}</span>
                      <span>•</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ flexShrink: 0, fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {issue.commentsCount} comments
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Drawer (if selected) */}
      {selectedIssue && (
        <aside
          style={{
            width: '420px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ISSUE #{selectedIssue.id}
            </span>
            <button
              onClick={() => setSelectedIssue(null)}
              className="btn btn-ghost btn-sm font-mono"
            >
              CLOSE
            </button>
          </div>

          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
              {selectedIssue.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={selectedIssue.status === 'open' ? 'badge badge-copper' : 'badge badge-success'}>
                {selectedIssue.status.toUpperCase()}
              </span>
              <span className="badge badge-neutral">{selectedIssue.tag}</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.55
              }}
            >
              {selectedIssue.description}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '6px' }}>
                AUDIT LOG ENTRY
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>
                Reported during Phase 2 Verification & S3 ancestry audit. Verified on local adapter.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Create Issue Modal */}
      {isCreating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 19, 22, 0.75)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                New Engine Issue
              </h3>
              <button onClick={() => setIsCreating(false)} className="btn btn-ghost btn-sm font-mono">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  ISSUE TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traversal check for symlink targets..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-text font-mono"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  TAG / CATEGORY
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input-text font-mono"
                  style={{ width: '100%' }}
                >
                  <option value="dvcs-engine">dvcs-engine</option>
                  <option value="s3-sync">s3-sync</option>
                  <option value="path-security">path-security</option>
                  <option value="revert-snapshot">revert-snapshot</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows={4}
                  placeholder="Technical details, observed behavior, and reproduction steps..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-text font-mono"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary font-mono"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn btn-primary font-mono">
                  SUBMIT ISSUE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
