import React, { useState } from 'react';
import {
  FileIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  HistoryIcon,
  ArrowLeftIcon
} from '@primer/octicons-react';

export const FileViewer = ({
  file,
  repoName,
  onBack
}) => {
  const [copied, setCopied] = useState(false);

  const lines = (file?.content || '').split('\n');

  const copyCode = () => {
    if (file?.content) {
      navigator.clipboard?.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Breadcrumb Navigation Line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px' }}>
        <button
          onClick={onBack}
          className="gh-btn gh-btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeftIcon size={14} />
          <span>Back</span>
        </button>

        <span style={{ color: 'var(--gh-accent)', cursor: 'pointer' }} onClick={onBack}>
          {repoName}
        </span>
        <span style={{ color: 'var(--gh-fg-muted)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--gh-fg-default)' }}>
          {file?.path || file?.name}
        </span>
      </div>

      {/* GitHub Source Code Box */}
      <div
        style={{
          border: '1px solid var(--gh-border-default)',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: 'var(--gh-bg-default)'
        }}
      >
        {/* Code Header Bar */}
        <div
          style={{
            backgroundColor: 'var(--gh-bg-subtle)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--gh-border-default)',
            fontSize: '12px',
            color: 'var(--gh-fg-muted)'
          }}
        >
          {/* File statistics: lines, size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{lines.length} lines ({Math.max(1, lines.filter(l => l.trim().length > 0).length)} loc)</span>
            <span>•</span>
            <span>{file?.size || '3.5 KB'}</span>
          </div>

          {/* Action buttons: Raw, Copy, Download */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="gh-btn gh-btn-sm" onClick={copyCode} title="Copy raw file">
              {copied ? (
                <>
                  <CheckIcon size={14} style={{ color: '#3fb950' }} />
                  <span style={{ color: '#3fb950' }}>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon size={14} />
                  <span>Raw</span>
                </>
              )}
            </button>

            <button
              className="gh-btn gh-btn-sm"
              onClick={() => {
                const blob = new Blob([file?.content || ''], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file?.name || 'source.txt';
                a.click();
              }}
              title="Download file"
            >
              <DownloadIcon size={14} />
            </button>

            <button className="gh-btn gh-btn-sm" title="View commit history">
              <HistoryIcon size={14} />
            </button>
          </div>
        </div>

        {/* Monospace Code Table with Line Numbers */}
        <div
          style={{
            overflowX: 'auto',
            padding: '8px 0',
            fontFamily: 'var(--github-font-mono)',
            fontSize: '12px',
            lineHeight: '20px'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {lines.map((line, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gh-bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Line Number Gutter */}
                  <td
                    style={{
                      width: '48px',
                      padding: '0 16px',
                      textAlign: 'right',
                      color: 'var(--gh-fg-muted)',
                      userSelect: 'none',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--gh-border-muted)'
                    }}
                  >
                    {idx + 1}
                  </td>
                  {/* Code Line */}
                  <td
                    style={{
                      padding: '0 16px',
                      color: 'var(--gh-fg-default)',
                      whiteSpace: 'pre',
                      verticalAlign: 'top'
                    }}
                  >
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
