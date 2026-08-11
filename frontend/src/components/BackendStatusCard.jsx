import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, CheckCircle, AlertTriangle, Cpu, Globe, Database, Terminal } from 'lucide-react';

export default function BackendStatusCard({ backendOnline, checkBackendHealth }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (err) {
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Express Backend Integration
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Backend directory (`/backend`) API endpoint status & response metadata
              </p>
            </div>
          </div>

          <button 
            onClick={() => { fetchHealth(); checkBackendHealth(); }}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'var(--glass-border)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* API Response Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          
          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: 'var(--glass-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Globe size={14} color="#34d399" /> Server Endpoint
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#c7d2fe', fontWeight: 600 }}>
              http://localhost:5000/api/health
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: 'var(--glass-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={14} color="#34d399" /> Connection Status
            </div>
            <div style={{ fontSize: '0.9rem', color: backendOnline ? '#34d399' : '#fb7185', fontWeight: 600 }}>
              {backendOnline ? '200 OK — Active' : 'Disconnected'}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: 'var(--glass-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Database size={14} color="#a855f7" /> Backend Directory Path
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              c:\project2\backend
            </div>
          </div>

        </div>

        {/* Payload Output */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Terminal size={14} /> Response JSON
          </div>
          <div style={{ padding: '1rem', borderRadius: '8px', background: '#05070d', border: 'var(--glass-border)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#34d399' }}>
            {healthData ? JSON.stringify(healthData, null, 2) : '// Click "Test Connection" after starting backend server (npm start)'}
          </div>
        </div>

      </div>

    </div>
  );
}
