import React, { useState } from 'react';
import { GitBranch, Folder, FileCode, Copy, Check, Terminal, Download, FileText, ChevronRight, ChevronDown, Clock, User, ShieldCheck } from 'lucide-react';

const mockFileTree = [
  {
    name: 'frontend',
    type: 'folder',
    children: [
      { name: 'package.json', type: 'file', content: `{\n  "name": "frontend",\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "lucide-react": "^0.469.0"\n  }\n}` },
      { name: 'src/App.jsx', type: 'file', content: `import React from 'react';\nimport Navbar from './components/Navbar';\nimport RepoHeader from './components/RepoHeader';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <h1>GitForge App</h1>\n    </div>\n  );\n}` },
      { name: 'src/index.css', type: 'file', content: `/* GitForge Modern Glassmorphism Styling */\n:root {\n  --primary: #6366f1;\n}` },
      { name: 'vite.config.js', type: 'file', content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});` }
    ]
  },
  {
    name: 'backend',
    type: 'folder',
    children: [
      { name: 'package.json', type: 'file', content: `{\n  "name": "gitforge-backend",\n  "version": "1.0.0",\n  "type": "module",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "dev": "node --watch index.js"\n  },\n  "dependencies": {\n    "express": "^4.21.2",\n    "cors": "^2.8.5",\n    "dotenv": "^16.4.7"\n  }\n}` },
      { name: 'index.js', type: 'file', content: `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\napp.use(cors());\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', project: 'GitForge' });\n});\n\napp.listen(5000, () => console.log('Backend live on 5000'));` }
    ]
  },
  { name: '.gitignore', type: 'file', content: `node_modules/\ndist/\n.env\n*.log` },
  { name: 'README.md', type: 'file', content: `# GitForge\n\nNext-Generation Developer Collaboration Platform\n\n## Structure\n- \`/frontend\`: React + Vite UI\n- \`/backend\`: Node.js Express REST API\n\n## Quick Start\n\`\`\`bash\ngit clone https://github.com/Pawar-Sudharshan/GitForge.git\ncd GitForge/frontend && npm install && npm run dev\ncd GitForge/backend && npm install && npm start\n\`\`\`` }
];

export default function CodeExplorer({ repoInfo }) {
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedFile, setSelectedFile] = useState(mockFileTree[3]); // README.md
  const [copied, setCopied] = useState(false);
  const [openFolders, setOpenFolders] = useState({ frontend: true, backend: true });

  const toggleFolder = (folderName) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const handleCopyClone = () => {
    navigator.clipboard.writeText('git clone https://github.com/Pawar-Sudharshan/GitForge.git');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
      
      {/* Top Action Bar: Branch Selector & Clone Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Branch Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: 'var(--glass-border)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            <GitBranch size={16} color="var(--primary)" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="main" style={{ background: '#121826' }}>main</option>
              <option value="feature/frontend-ui" style={{ background: '#121826' }}>feature/frontend-ui</option>
              <option value="feature/backend-api" style={{ background: '#121826' }}>feature/backend-api</option>
            </select>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>2</strong> branches &bull; <strong>1</strong> release
          </span>
        </div>

        {/* Clone Command Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#c7d2fe' }}>
            <Terminal size={14} color="var(--primary)" />
            <span>git clone https://github.com/Pawar-Sudharshan/GitForge.git</span>
            <button onClick={handleCopyClone} style={{ color: copied ? '#34d399' : 'var(--text-muted)', marginLeft: '0.4rem' }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Latest Commit Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
            PS
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>
              Pawar-Sudharshan
            </span>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Initial project setup & directory structure (frontend + backend)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>
            0de3996
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} /> Just now
          </span>
        </div>
      </div>

      {/* Explorer Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem' }}>
        
        {/* Left Side: Directory Tree */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            Repository Files
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
            {mockFileTree.map((item, idx) => {
              if (item.type === 'folder') {
                const isOpen = openFolders[item.name];
                return (
                  <div key={idx}>
                    <div 
                      onClick={() => toggleFolder(item.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        fontWeight: 500,
                        userSelect: 'none'
                      }}
                    >
                      {isOpen ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                      <Folder size={16} color="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                      <span>{item.name}</span>
                    </div>

                    {isOpen && (
                      <div style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.1rem' }}>
                        {item.children.map((child, cIdx) => (
                          <div
                            key={cIdx}
                            onClick={() => setSelectedFile(child)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: selectedFile.name === child.name ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                              color: selectedFile.name === child.name ? '#c7d2fe' : 'var(--text-muted)',
                              fontWeight: selectedFile.name === child.name ? 600 : 400
                            }}
                          >
                            <FileCode size={14} color={selectedFile.name === child.name ? '#818cf8' : 'var(--text-dim)'} />
                            <span>{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedFile(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: selectedFile.name === item.name ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: selectedFile.name === item.name ? '#c7d2fe' : 'var(--text-muted)',
                      fontWeight: selectedFile.name === item.name ? 600 : 400
                    }}
                  >
                    <FileText size={14} color={selectedFile.name === item.name ? '#818cf8' : 'var(--text-dim)'} />
                    <span>{item.name}</span>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Right Side: File Content Viewer */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: 'var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
              <FileCode size={16} color="var(--primary)" />
              <span>{selectedFile.name}</span>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {selectedFile.content ? selectedFile.content.split('\n').length : 0} lines
            </span>
          </div>

          <div style={{ padding: '1.25rem', background: '#070a12', overflowX: 'auto' }}>
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: '#e2e8f0',
              margin: 0
            }}>
              {selectedFile.content || "// Empty file"}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
