import React from 'react';
import { IconTerminal, IconCopy, IconCheck } from '../Common/Icons';

export const CliModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconTerminal size={18} style={{ color: 'var(--accent-copper)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ApnaGit CLI Engine Specification (v0.2.0)
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm font-mono">
            ✕
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Run these commands directly in PowerShell / Terminal inside your repository root:
          </p>

          {[
            {
              cmd: "node index.js init",
              desc: "Initializes .apnaGit/ metadata, staging buffer, and empty head.json."
            },
            {
              cmd: "node index.js add <file>",
              desc: "Sanitizes relative path against traversal escapes and stages the file."
            },
            {
              cmd: "node index.js rm <file>",
              desc: "Stages a deletion tombstone (.deleted) and removes file from working directory."
            },
            {
              cmd: "node index.js commit <message>",
              desc: "Materializes a full-tree snapshot from parent + staging and records parentCommit pointer."
            },
            {
              cmd: "node index.js revert <commitId>",
              desc: "Rolls back repository workspace to target snapshot while safely preserving untracked files."
            },
            {
              cmd: "node index.js push",
              desc: "Validates remote HEAD ancestry (fast-forward vs divergent) and updates remote S3 HEAD."
            },
            {
              cmd: "node index.js pull",
              desc: "Fetches remote snapshots and fast-forwards local HEAD pointer."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--accent-copper)', fontWeight: 600 }}>
                {item.cmd}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button onClick={onClose} className="btn btn-secondary font-mono btn-sm">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
