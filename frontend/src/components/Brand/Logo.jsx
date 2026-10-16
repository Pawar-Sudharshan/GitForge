import React from 'react';

/**
 * GitForge Brand Symbol & Wordmark
 * Inspired by an industrial forge crucible / anvil base intersected with a branching commit tree DAG.
 */
export const GitForgeSymbol = ({ size = 22, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    {/* Forged Anvil Base Plate */}
    <path
      d="M3 19H21L19 16H5L3 19Z"
      fill="#D97736"
    />
    {/* Central Vertical Trunk Lineage */}
    <line
      x1="12"
      y1="6"
      x2="12"
      y2="16"
      stroke="#D97736"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Branching Left & Right Lines */}
    <path
      d="M12 11L6 7"
      stroke="#EDEDEC"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 11L18 7"
      stroke="#EDEDEC"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Root & Branch Commit Nodes */}
    <circle cx="12" cy="11" r="2" fill="#D97736" />
    <circle cx="6" cy="7" r="2.2" fill="#EDEDEC" stroke="#121316" strokeWidth="1" />
    <circle cx="18" cy="7" r="2.2" fill="#EDEDEC" stroke="#121316" strokeWidth="1" />
    <circle cx="12" cy="4" r="2.5" fill="#E88C48" stroke="#121316" strokeWidth="1" />
  </svg>
);

export const GitForgeLogo = ({ compact = false, showTagline = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', userSelect: 'none' }}>
      <GitForgeSymbol size={24} />
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              GitForge
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-copper)',
                background: 'var(--accent-copper-soft)',
                padding: '1px 4px',
                borderRadius: '2px',
                border: '1px solid var(--accent-copper-border)',
                fontWeight: 600,
              }}
            >
              DVCS
            </span>
          </div>
          {showTagline && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                marginTop: '3px',
              }}
            >
              FULL-TREE SNAPSHOTS
            </span>
          )}
        </div>
      )}
    </div>
  );
};
