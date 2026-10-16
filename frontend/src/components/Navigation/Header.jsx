import React from 'react';
import { IconChevronRight, IconOffline, IconRevert, IconTerminal, IconCheck } from '../Common/Icons';

export const Header = ({
  currentRepo,
  repositories,
  onSelectRepo,
  currentView,
  onOpenRevert,
  onOpenCliGuide
}) => {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* Left: Breadcrumbs & Repository Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}
        >
          forge://
        </span>

        {/* Repo Dropdown */}
        <select
          value={currentRepo?.id || ''}
          onChange={(e) => {
            const found = repositories.find((r) => r.id === e.target.value);
            if (found) onSelectRepo(found);
          }}
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.name}
            </option>
          ))}
        </select>

        <IconChevronRight size={12} style={{ color: 'var(--text-muted)' }} />

        {/* Branch & Commit Hash */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}
          >
            {currentRepo?.defaultBranch || 'main'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--accent-copper)',
              backgroundColor: 'var(--accent-copper-soft)',
              padding: '1px 5px',
              borderRadius: '2px',
              border: '1px solid var(--accent-copper-border)'
            }}
          >
            @{currentRepo?.headCommitId.substring(0, 7)}
          </span>
        </div>
      </div>

      {/* Right: Operational Status & Workbench Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Working Tree Clean Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-success)',
            padding: '2px 6px',
            borderRadius: '2px',
            backgroundColor: 'var(--color-success-soft)'
          }}
        >
          <IconCheck size={12} />
          <span>TREE_CLEAN</span>
        </div>

        {/* Honest Local Mode Indicator Pill */}
        <div
          title="AWS S3 credentials not configured. GitForge is operating in deterministic local-first mode."
          className="badge badge-local"
          style={{ cursor: 'help' }}
        >
          <IconOffline size={12} />
          <span>LOCAL_MODE (S3_OFFLINE)</span>
        </div>

        {/* Safe Revert Action */}
        <button
          onClick={onOpenRevert}
          className="btn btn-secondary btn-sm font-mono"
          title="Safe Revert: Restore snapshot while preserving untracked files"
        >
          <IconRevert size={12} style={{ color: 'var(--accent-copper)' }} />
          <span>revert</span>
        </button>

        {/* CLI Quick Reference */}
        <button
          onClick={onOpenCliGuide}
          className="btn btn-ghost btn-sm font-mono"
          title="CLI Guide & Architecture"
        >
          <IconTerminal size={12} />
          <span>cli:help</span>
        </button>
      </div>
    </header>
  );
};
