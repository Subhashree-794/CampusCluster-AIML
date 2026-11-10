import React from 'react';
import { Sparkles, Server } from 'lucide-react';

export default function Navbar({ title, subtitle, onQuickGenerate, onDemoLoad }) {
  return (
    <header className="top-navbar">
      <div className="page-title-area">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="nav-actions">
        {onDemoLoad && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onDemoLoad}
            title="Seed 20 realistic student profiles"
          >
            Load Demo Students
          </button>
        )}
        {onQuickGenerate && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={onQuickGenerate}
          >
            <Sparkles size={14} />
            <span>Generate Groups</span>
          </button>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: '6px',
          background: '#f1f5f9',
          color: '#475569',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          <Server size={13} color="#2563eb" />
          <span>Flask 127.0.0.1:5000</span>
        </div>
      </div>
    </header>
  );
}

