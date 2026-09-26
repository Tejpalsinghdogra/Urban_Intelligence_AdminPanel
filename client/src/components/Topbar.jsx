import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';

export default function Topbar() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
          <h2 className="topbar-heading" style={{ margin: 0, padding: 0, lineHeight: 1.25 }}>
            UrbanSight ICCC Command Center
          </h2>
          <span className="topbar-subheading" style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.2, margin: 0 }}>
            Integrated Command and Control Centre (ICCC) • Multi-Agency Autonomous Dispatch
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="live-badge" title={isConnected ? 'Real-time WebSocket active' : 'Connecting to socket...'}>
          <span className="live-dot" style={{ backgroundColor: isConnected ? '#16a34a' : '#eab308' }}></span>
          <span>{isConnected ? 'LIVE FEED' : 'CONNECTING...'}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#334155'
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.68rem',
              letterSpacing: '0.5px',
              border: '1px solid #334155'
            }}
          >
            ICCC
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>ICCC Command</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Central Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
}
