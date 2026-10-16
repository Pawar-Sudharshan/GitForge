import React, { useState } from 'react';
import {
  MarkGithubIcon,
  ThreeBarsIcon,
  SearchIcon,
  PlusIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  TriangleDownIcon,
  RepoIcon,
  IssueOpenedIcon,
  GitBranchIcon
} from '@primer/octicons-react';

export const GitHubHeader = ({
  currentView,
  onViewChange,
  themeMode,
  onToggleTheme,
  onOpenNewRepo,
  user
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  return (
    <header
      style={{
        backgroundColor: 'var(--gh-header-bg)',
        color: 'var(--gh-header-fg)',
        borderBottom: '1px solid var(--gh-border-default)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        lineHeight: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        userSelect: 'none'
      }}
    >
      {/* Left: Hamburger, Brand Mark, Search & Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        {/* Menu button */}
        <button
          onClick={() => onViewChange('dashboard')}
          title="Dashboard menu"
          style={{
            background: 'none',
            border: '1px solid var(--gh-border-default)',
            borderRadius: '6px',
            color: 'var(--gh-header-fg)',
            padding: '5px 7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ThreeBarsIcon size={16} />
        </button>

        {/* GitHub / GitForge Logo */}
        <div
          onClick={() => onViewChange('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--gh-header-fg)'
          }}
        >
          <MarkGithubIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '-0.01em' }}>
            GitForge
          </span>
        </div>

        {/* Search Field (Type / to search) */}
        <div
          style={{
            position: 'relative',
            maxWidth: '320px',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '8px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--gh-fg-muted)',
              pointerEvents: 'none'
            }}
          >
            <SearchIcon size={16} />
          </div>
          <input
            type="text"
            placeholder="Type / to search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--gh-header-search-bg)',
              border: '1px solid var(--gh-header-search-border)',
              borderRadius: '6px',
              padding: '5px 32px 5px 30px',
              color: 'var(--gh-fg-default)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '8px',
              border: '1px solid var(--gh-border-default)',
              borderRadius: '4px',
              padding: '0 4px',
              fontSize: '11px',
              color: 'var(--gh-fg-muted)',
              pointerEvents: 'none',
              fontFamily: 'var(--github-font-mono)'
            }}
          >
            /
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '8px' }}>
          <button
            onClick={() => onViewChange('dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: currentView === 'dashboard' ? 'var(--gh-header-fg)' : 'var(--gh-fg-muted)',
              fontWeight: currentView === 'dashboard' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('issues')}
            style={{
              background: 'none',
              border: 'none',
              color: currentView === 'issues' ? 'var(--gh-header-fg)' : 'var(--gh-fg-muted)',
              fontWeight: currentView === 'issues' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Issues
          </button>
          <button
            onClick={() => onViewChange('lineage')}
            style={{
              background: 'none',
              border: 'none',
              color: currentView === 'lineage' ? 'var(--gh-header-fg)' : 'var(--gh-fg-muted)',
              fontWeight: currentView === 'lineage' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Lineage
          </button>
        </nav>
      </div>

      {/* Right: Actions, Notifications, Theme, User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Create (+) Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--gh-border-default)',
              borderRadius: '6px',
              color: 'var(--gh-header-fg)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Create new..."
          >
            <PlusIcon size={16} />
            <TriangleDownIcon size={12} />
          </button>

          {isNewMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '180px',
                backgroundColor: 'var(--gh-bg-default)',
                border: '1px solid var(--gh-border-default)',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(1,4,9,0.3)',
                padding: '4px 0',
                zIndex: 200
              }}
            >
              <div
                onClick={() => {
                  setIsNewMenuOpen(false);
                  onOpenNewRepo();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  color: 'var(--gh-fg-default)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gh-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <RepoIcon size={14} />
                <span>New repository</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon with dot */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gh-header-fg)',
            cursor: 'pointer',
            padding: '4px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Notifications"
        >
          <BellIcon size={16} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--gh-accent)'
            }}
          />
        </button>

        {/* Theme Switcher Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} theme`}
          style={{
            background: 'none',
            border: '1px solid var(--gh-border-default)',
            borderRadius: '6px',
            color: 'var(--gh-header-fg)',
            padding: '5px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {themeMode === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>

        {/* User Avatar */}
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#30363d',
            border: '1px solid var(--gh-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer'
          }}
          title={`Signed in as ${user?.username || 'sudharshan'}`}
        >
          {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
        </div>
      </div>
    </header>
  );
};
