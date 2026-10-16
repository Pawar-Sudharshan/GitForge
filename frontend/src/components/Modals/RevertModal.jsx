import React, { useState } from 'react';
import { IconRevert, IconCheck, IconAlert } from '../Common/Icons';

export const RevertModal = ({ commit, currentRepo, isOpen, onClose, onConfirmRevert }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !commit) return null;

  const handleExecute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onConfirmRevert?.(commit);
        onClose();
      }, 1400);
    }, 800);
  };

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
        zIndex: 110,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconRevert size={18} style={{ color: 'var(--accent-copper)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Safe Revert to Snapshot
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm font-mono" disabled={isProcessing}>
            ✕
          </button>
        </div>

        {/* Target Details */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>TARGET SNAPSHOT</div>
          <div style={{ color: 'var(--accent-copper)', fontWeight: 600, marginTop: '2px' }}>
            {commit.id} ({commit.shortId})
          </div>
          <div style={{ color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-ui)' }}>
            "{commit.message}"
          </div>
        </div>

        {/* Safe Revert Phase 2 Invariants */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(201, 148, 59, 0.08)',
            border: '1px solid rgba(201, 148, 59, 0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            lineHeight: 1.5,
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 600, marginBottom: '4px' }}>
            <IconAlert size={14} />
            <span>PHASE 2 SAFETY GUARANTEE</span>
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            <li>Untracked workspace files are <strong>strictly preserved</strong>.</li>
            <li>Only files present in the snapshot manifest will be overwritten.</li>
            <li>Local HEAD pointer will be updated to <code>{commit.shortId}</code>.</li>
          </ul>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary font-mono"
            disabled={isProcessing}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleExecute}
            className="btn btn-primary font-mono"
            disabled={isProcessing || success}
          >
            {success ? (
              <>
                <IconCheck size={14} />
                <span>REVERT COMPLETE</span>
              </>
            ) : isProcessing ? (
              <span>RESTORING SNAPSHOT...</span>
            ) : (
              <>
                <IconRevert size={14} />
                <span>CONFIRM SAFE REVERT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
