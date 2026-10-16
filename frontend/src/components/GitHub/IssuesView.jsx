import React, { useState } from 'react';
import {
  IssueOpenedIcon,
  CheckCircleIcon,
  SearchIcon,
  TagIcon,
  MilestoneIcon,
  CommentIcon,
  PlusIcon
} from '@primer/octicons-react';

export const IssuesView = ({
  issues,
  onCreateIssue
}) => {
  const [filterState, setFilterState] = useState('open'); // 'open' | 'closed'
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [selectedTag, setSelectedTag] = useState('dvcs-engine');
  const [searchQuery, setSearchQuery] = useState('is:issue is:open ');

  const openCount = issues.filter((i) => i.status === 'open').length;
  const closedCount = issues.filter((i) => i.status === 'closed').length;

  const filteredIssues = issues.filter((i) => {
    if (filterState === 'open') return i.status === 'open';
    if (filterState === 'closed') return i.status === 'closed';
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateIssue({
      id: `iss-${Date.now().toString().slice(-4)}`,
      repoId: 'repo-apnagit-core',
      title: newTitle.trim(),
      description: newBody.trim() || 'No description provided.',
      status: 'open',
      author: 'sudharshan',
      createdAt: new Date().toISOString(),
      tag: selectedTag,
      commentsCount: 0
    });

    setNewTitle('');
    setNewBody('');
    setIsNewIssueOpen(false);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Top Toolbar: Filters & New Issue Green Button */}
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
        {/* Search bar + Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '640px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', left: '10px', color: 'var(--gh-fg-muted)' }}>
              <SearchIcon size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all issues"
              style={{
                width: '100%',
                backgroundColor: 'var(--gh-bg-default)',
                border: '1px solid var(--gh-border-default)',
                borderRadius: '6px',
                padding: '5px 12px 5px 32px',
                fontSize: '13px',
                color: 'var(--gh-fg-default)',
                fontFamily: 'var(--github-font-ui)',
                outline: 'none'
              }}
            />
          </div>

          <button className="gh-btn">
            <TagIcon size={14} />
            <span>Labels</span>
          </button>

          <button className="gh-btn">
            <MilestoneIcon size={14} />
            <span>Milestones</span>
          </button>
        </div>

        {/* Green New Issue Button */}
        <button
          onClick={() => setIsNewIssueOpen(true)}
          className="gh-btn gh-btn-primary"
        >
          <span>New issue</span>
        </button>
      </div>

      {/* GitHub Issue List Container */}
      <div
        style={{
          border: '1px solid var(--gh-border-default)',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: 'var(--gh-bg-default)'
        }}
      >
        {/* Table Header: Open / Closed Tabs */}
        <div
          style={{
            backgroundColor: 'var(--gh-bg-subtle)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--gh-border-default)',
            fontSize: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => {
                setFilterState('open');
                setSearchQuery('is:issue is:open ');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: filterState === 'open' ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)',
                fontWeight: filterState === 'open' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <IssueOpenedIcon size={16} style={{ color: filterState === 'open' ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)' }} />
              <span>{openCount} Open</span>
            </button>

            <button
              onClick={() => {
                setFilterState('closed');
                setSearchQuery('is:issue is:closed ');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: filterState === 'closed' ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)',
                fontWeight: filterState === 'closed' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <CheckCircleIcon size={16} style={{ color: filterState === 'closed' ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)' }} />
              <span>{closedCount} Closed</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--gh-fg-muted)', fontSize: '13px' }}>
            <span>Author</span>
            <span>Label</span>
            <span>Projects</span>
            <span>Milestones</span>
            <span>Assignee</span>
            <span>Sort</span>
          </div>
        </div>

        {/* Issue Rows */}
        {filteredIssues.map((issue) => {
          const isOpen = issue.status === 'open';
          return (
            <div
              key={issue.id}
              className="gh-table-row"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px 16px',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                {/* State Icon */}
                <div style={{ marginTop: '2px', color: isOpen ? '#3fb950' : '#a371f7' }}>
                  {isOpen ? <IssueOpenedIcon size={16} /> : <CheckCircleIcon size={16} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: 'var(--gh-fg-default)'
                      }}
                    >
                      {issue.title}
                    </span>

                    {/* Label Badge */}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 8px',
                        borderRadius: '2em',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: issue.tag === 'bug' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(56, 139, 253, 0.15)',
                        color: issue.tag === 'bug' ? '#f85149' : '#58a6ff',
                        border: '1px solid transparent'
                      }}
                    >
                      {issue.tag}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '12px',
                      color: 'var(--gh-fg-muted)'
                    }}
                  >
                    #{issue.id} opened 2 hours ago by {issue.author}
                  </div>
                </div>
              </div>

              {/* Comments count */}
              {issue.commentsCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gh-fg-muted)', fontSize: '12px' }}>
                  <CommentIcon size={14} />
                  <span>{issue.commentsCount}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gh-fg-muted)' }}>
            No {filterState} issues found.
          </div>
        )}
      </div>

      {/* GitHub New Issue Dialog */}
      {isNewIssueOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(1, 4, 9, 0.7)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              backgroundColor: 'var(--gh-bg-default)',
              border: '1px solid var(--gh-border-default)',
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(1,4,9,0.3)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--gh-bg-subtle)',
                padding: '14px 18px',
                borderBottom: '1px solid var(--gh-border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Create new issue</span>
              <button
                onClick={() => setIsNewIssueOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--gh-fg-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--gh-border-default)',
                    backgroundColor: 'var(--gh-bg-subtle)',
                    color: 'var(--gh-fg-default)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--gh-border-default)',
                    backgroundColor: 'var(--gh-bg-subtle)',
                    color: 'var(--gh-fg-default)',
                    fontSize: '13px'
                  }}
                >
                  <option value="dvcs-engine">dvcs-engine</option>
                  <option value="bug">bug</option>
                  <option value="enhancement">enhancement</option>
                  <option value="s3-sync">s3-sync</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Leave a comment"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--gh-border-default)',
                    backgroundColor: 'var(--gh-bg-subtle)',
                    color: 'var(--gh-fg-default)',
                    fontSize: '13px',
                    resize: 'vertical',
                    fontFamily: 'var(--github-font-ui)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--gh-border-muted)', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewIssueOpen(false)}
                  className="gh-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary"
                >
                  Submit new issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
