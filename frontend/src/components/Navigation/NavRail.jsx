import React from 'react';
import { GitForgeSymbol } from '../Brand/Logo';
import {
  IconRepo,
  IconLineage,
  IconSnapshot,
  IconIssue,
  IconSettings,
  IconOffline,
  IconUser,
  IconTerminal
} from '../Common/Icons';

export const NavRail = ({ currentView, onViewChange, onAuthClick, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Repositories', icon: IconRepo },
    { id: 'explorer', label: 'Code Explorer', icon: IconSnapshot },
    { id: 'lineage', label: 'Commit Lineage DAG', icon: IconLineage },
    { id: 'issues', label: 'Engine Issues', icon: IconIssue },
    { id: 'landing', label: 'Product Architecture', icon: IconTerminal },
    { id: 'settings', label: 'Local Engine Settings', icon: IconSettings }
  ];

  return (
    <nav
      style={{
        width: 'var(--rail-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        zIndex: 50,
        flexShrink: 0,
        userSelect: 'none'
      }}
      aria-label="Sidebar Navigation"
    >
      {/* Top Forge Symbol */}
      <button
        onClick={() => onViewChange('dashboard')}
        title="GitForge Home"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <GitForgeSymbol size={24} />
      </button>

      {/* Main Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={item.label}
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'var(--accent-copper-soft)' : 'transparent',
                color: isActive ? 'var(--accent-copper)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {/* Active left indicator pip */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '8px',
                    bottom: '8px',
                    width: '3px',
                    backgroundColor: 'var(--accent-copper)',
                    borderRadius: '0 2px 2px 0'
                  }}
                />
              )}
              <Icon size={18} />
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Bottom Rail Utilities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
        {/* Local-Only Mode Indicator */}
        <div
          title="Local-Only Mode: AWS S3 unlinked. Storing snapshots on local disk."
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-warning)',
            cursor: 'help'
          }}
        >
          <IconOffline size={16} />
        </div>

        {/* User Account / Auth */}
        <button
          onClick={onAuthClick}
          title={user ? `Signed in as ${user.username}` : "Account Sign In"}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: user ? 'var(--accent-copper)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <IconUser size={15} />
        </button>
      </div>
    </nav>
  );
};
