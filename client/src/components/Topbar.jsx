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
        <div>
          <h2 className="topbar-heading">UrbanSight Command Center</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            AI-Driven Fleet Sensor Analytics & Multi-Agency Dispatch
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
            gap: '0.5rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#334155'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            ADM
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Authority Admin</span>
        </div>
      </div>
    </header>
  );
}
