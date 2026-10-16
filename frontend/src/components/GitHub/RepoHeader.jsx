import React from 'react';
import {
  RepoIcon,
  EyeIcon,
  RepoForkedIcon,
  StarIcon,
  TriangleDownIcon,
  CodeIcon,
  IssueOpenedIcon,
  GitBranchIcon,
  PackageIcon,
  GearIcon,
  PinIcon
} from '@primer/octicons-react';

export const RepoHeader = ({
  currentRepo,
  activeTab,
  onTabChange,
  issuesCount = 3
}) => {
  const tabs = [
    { id: 'code', label: 'Code', icon: CodeIcon },
    { id: 'issues', label: 'Issues', icon: IssueOpenedIcon, count: issuesCount },
    { id: 'lineage', label: 'Commit Lineage', icon: GitBranchIcon, count: currentRepo.commits.length },
    { id: 'snapshots', label: 'Snapshots & Revert', icon: PackageIcon },
    { id: 'settings', label: 'Settings', icon: GearIcon }
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--gh-bg-subtle)',
        borderBottom: '1px solid var(--gh-border-default)',
        padding: '16px 24px 0 24px',
        userSelect: 'none'
      }}
    >
      {/* Top line: Repo Title + Badges + Watch/Fork/Star Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        {/* Repo Title Breadcrumb & Visibility Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', lineHeight: '26px' }}>
          <RepoIcon size={18} style={{ color: 'var(--gh-fg-muted)' }} />
          <span style={{ color: 'var(--gh-accent)', cursor: 'pointer' }}>sudharshan</span>
          <span style={{ color: 'var(--gh-fg-muted)' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--gh-accent)', cursor: 'pointer' }}>
            {currentRepo.name}
          </span>
          <span className="gh-badge" style={{ textTransform: 'capitalize', marginLeft: '4px' }}>
            {currentRepo.visibility}
          </span>
          {/* Honest Local Mode tag */}
          <span
            className="gh-badge"
            style={{
              borderColor: 'rgba(210, 153, 34, 0.4)',
              color: 'var(--gh-warning-fg)',
              backgroundColor: 'rgba(210, 153, 34, 0.1)',
              fontSize: '11px'
            }}
            title="Local-only DVCS mode. AWS S3 synchronization unlinked."
          >
            Local Engine
          </span>
        </div>

        {/* Action Buttons: Pin, Watch, Fork, Star */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="gh-btn gh-btn-sm" title="Pin repository">
            <PinIcon size={14} style={{ color: 'var(--gh-fg-muted)' }} />
            <span>Pin</span>
          </button>

          <button className="gh-btn gh-btn-sm" title="Watch repository">
            <EyeIcon size={14} style={{ color: 'var(--gh-fg-muted)' }} />
            <span>Watch</span>
            <span className="gh-counter">1</span>
          </button>

          <button className="gh-btn gh-btn-sm" title="Fork repository">
            <RepoForkedIcon size={14} style={{ color: 'var(--gh-fg-muted)' }} />
            <span>Fork</span>
            <span className="gh-counter">0</span>
          </button>

          {/* Star Split Button */}
          <div style={{ display: 'inline-flex' }}>
            <button
              className="gh-btn gh-btn-sm"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              <StarIcon size={14} style={{ color: 'var(--gh-fg-muted)' }} />
              <span>Star</span>
              <span className="gh-counter">2</span>
            </button>
            <button
              className="gh-btn gh-btn-sm"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: 'none',
                padding: '2px 6px'
              }}
            >
              <TriangleDownIcon size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* GitHub UnderlineNav Tabs */}
      <nav
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}
        aria-label="Repository"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #f78166' : '2px solid transparent',
                color: isActive ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '14px',
                lineHeight: '21px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'border-color 80ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderBottomColor = 'var(--gh-border-muted)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderBottomColor = 'transparent';
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)' }} />
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className="gh-counter">{tab.count}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
