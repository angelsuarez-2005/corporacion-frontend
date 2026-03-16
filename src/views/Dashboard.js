import React from 'react';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const user   = useSelector(s => s.auth.user);
  const nombre = user?.name || user?.username || 'Usuario';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', gap: '24px',
      fontFamily: 'Sora, sans-serif', textAlign: 'center',
    }}>
      {/* Ícono de lentes */}
      <div style={{
        width: '110px', height: '110px', borderRadius: '32px',
        background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 16px 40px rgba(56,189,248,0.4)',
      }}>
        <svg width="68" height="68" viewBox="0 0 80 80" fill="none">
          {/* Puente */}
          <path d="M28 40 C30 35 35 32 40 32 C45 32 50 35 52 40"
            stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
          {/* Aro izquierdo */}
          <rect x="3" y="24" width="26" height="30" rx="11"
            stroke="white" strokeWidth="4.5" fill="none"/>
          {/* Aro derecho */}
          <rect x="51" y="24" width="26" height="30" rx="11"
            stroke="white" strokeWidth="4.5" fill="none"/>
          {/* Varilla izquierda */}
          <line x1="3" y1="35" x2="-2" y2="33"
            stroke="white" strokeWidth="4" strokeLinecap="round"/>
          {/* Varilla derecha */}
          <line x1="77" y1="35" x2="82" y2="33"
            stroke="white" strokeWidth="4" strokeLinecap="round"/>
          {/* Brillo interno */}
          <circle cx="16" cy="39" r="6" fill="rgba(255,255,255,0.2)"/>
          <circle cx="64" cy="39" r="6" fill="rgba(255,255,255,0.2)"/>
        </svg>
      </div>

      {/* Texto */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0c1a2e', margin: '0 0 8px' }}>
          ¡Bienvenido, <span style={{ color: '#0284c7' }}>{nombre}</span>!
        </h1>
        <p style={{ fontSize: '15px', color: '#9ca3af', margin: 0 }}>
          Corporación Ópticas · Sistema de Gestión
        </p>
      </div>
    </div>
  );
}
