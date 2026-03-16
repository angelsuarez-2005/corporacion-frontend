import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setStock, setAllStock } from '../../redux/stockSlice';
import { stockAPI } from '../../services/api';

/* ─── Categorías ─────────────────────────────────────────────────── */
const CATEGORIAS = [
  { id: 'metal',    label: 'Metal',              color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
  { id: 'carey',    label: 'Carey',              color: '#92400e', bg: '#fef3c7', border: '#fde68a', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { id: 'acetato',  label: 'Acetato',            color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="5"/><line x1="12" y1="7" x2="12" y2="17"/></svg> },
  { id: 'ninos',    label: 'Niños',              color: '#db2777', bg: '#fce7f3', border: '#fbcfe8', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'solares',  label: 'Solares',            color: '#d97706', bg: '#fef3c7', border: '#fde68a', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
  { id: 'lectura',  label: 'Lectura',            color: '#059669', bg: '#d1fae5', border: '#a7f3d0', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { id: 'al-aire',  label: 'Al Aire',            color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg> },
  { id: 'liquidos', label: 'Líquidos',           color: '#0891b2', bg: '#cffafe', border: '#a5f3fc', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
  { id: 'contacto', label: 'Lentes de Contacto', color: '#4f46e5', bg: '#e0e7ff', border: '#c7d2fe', icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg> },
];

/* ─── Indicador de stock ─────────────────────────────────────────── */
function stockBadge(n) {
  if (n >= 20) return { label: 'Stock OK',      bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' };
  if (n >= 8)  return { label: 'Stock Bajo',    bg: '#fef9c3', color: '#ca8a04', dot: '#eab308' };
  return              { label: 'Stock Crítico', bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' };
}

const CloseIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ─── Vista principal Sedes ───────────────────────────────────────── */
export default function Sedes() {
  const [params]    = useSearchParams();
  const dispatch    = useDispatch();
  const stockData   = useSelector(s => s.stock.data);

  const distrito = params.get('d') || '';
  const tienda   = params.get('t') || '';

  const [editCat, setEditCat] = useState(null);
  const [inputVal, setInputVal] = useState('');

  const key   = `${distrito}:${tienda}`;
  const stock = stockData[key] || {};

  /* Cargar stock desde MongoDB al montar */
  useEffect(() => {
    stockAPI.getAll()
      .then(data => dispatch(setAllStock(data)))
      .catch(() => {/* sin conexión, usa lo que hay en Redux */});
  }, [dispatch]);

  const openEdit = (cat) => {
    setInputVal(String(stock[cat.id] ?? 0));
    setEditCat(cat);
  };

  const saveEdit = () => {
    const n = Math.max(0, parseInt(inputVal, 10) || 0);
    /* 1. Actualizar Redux inmediatamente */
    dispatch(setStock({ key, catId: editCat.id, value: n }));
    /* 2. Persistir en MongoDB */
    const updatedCategorias = { ...(stockData[key] || {}), [editCat.id]: n };
    stockAPI.update(key, updatedCategorias).catch(() => {/* fallo silencioso */});
    setEditCat(null);
  };

  /* ── Nivel 2: tarjetas de stock ── */
  if (tienda) {
    const totalLentes = CATEGORIAS.reduce((a, c) => a + (stock[c.id] ?? 0), 0);
    const criticos    = CATEGORIAS.filter(c => (stock[c.id] ?? 0) < 8).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Sora,sans-serif' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
              {distrito} ›&nbsp;
              <span style={{ color: '#0284c7', fontWeight: 700 }}>{tienda}</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0c1a2e', margin: 0 }}>{tienda}</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>
              {totalLentes} lentes en stock total
              {criticos > 0 && (
                <span style={{ marginLeft: '10px', background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                  ⚠ {criticos} categoría{criticos > 1 ? 's' : ''} con stock crítico
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[{ label: 'Stock OK (≥20)', bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
            { label: 'Stock Bajo (8–19)', bg: '#fef9c3', color: '#ca8a04', dot: '#eab308' },
            { label: 'Stock Crítico (<8)', bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' }
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: b.bg, padding: '4px 12px', borderRadius: '99px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.dot }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: b.color }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Grid de tarjetas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {CATEGORIAS.map(cat => {
            const n   = stock[cat.id] ?? 0;
            const bdg = stockBadge(n);
            return (
              <div
                key={cat.id}
                onClick={() => openEdit(cat)}
                style={{
                  background: 'white', borderRadius: '16px',
                  border: `2px solid ${n < 8 ? '#fca5a5' : n < 20 ? '#fde68a' : '#e5e7eb'}`,
                  padding: '20px 16px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0c1a2e', lineHeight: 1.3 }}>{cat.label}</span>
                <div style={{ fontSize: '38px', fontWeight: 800, color: n < 8 ? '#dc2626' : n < 20 ? '#ca8a04' : '#0c1a2e', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '-6px' }}>lentes</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: bdg.bg, padding: '3px 10px', borderRadius: '99px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: bdg.dot }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: bdg.color }}>{bdg.label}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#c0c8d4', marginTop: '2px' }}>Clic para actualizar</div>
              </div>
            );
          })}
        </div>

        {/* Modal actualizar stock */}
        {editCat && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: editCat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: editCat.color }}>
                    {React.cloneElement(editCat.icon, { width: 18, height: 18 })}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{tienda}</div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#0c1a2e' }}>{editCat.label}</div>
                  </div>
                </div>
                <button onClick={() => setEditCat(null)} style={{ width: '32px', height: '32px', border: 'none', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
                  <CloseIcon />
                </button>
              </div>
              <div style={{ padding: '28px 24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>
                  Cantidad de lentes en stock
                </label>
                <input
                  type="number" min="0" value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  autoFocus
                  style={{ width: '100%', padding: '14px', border: `2px solid ${editCat.color}`, borderRadius: '12px', fontSize: '28px', fontWeight: 800, color: '#0c1a2e', textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontFamily: 'Sora,sans-serif' }}
                />
                {parseInt(inputVal, 10) >= 0 && (() => {
                  const bdg = stockBadge(parseInt(inputVal, 10) || 0);
                  return (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <span style={{ background: bdg.bg, color: bdg.color, padding: '4px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700 }}>{bdg.label}</span>
                    </div>
                  );
                })()}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => setEditCat(null)} style={{ padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', fontSize: '14px', fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>
                  Cancelar
                </button>
                <button onClick={saveEdit} style={{ padding: '10px 24px', border: 'none', borderRadius: '10px', background: `linear-gradient(135deg,${editCat.color}cc,${editCat.color})`, color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora,sans-serif', boxShadow: `0 4px 12px ${editCat.color}55` }}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Nivel 1: tarjetas por tienda ── */
  const navConfig   = require('../../navigation/navConfig').default;
  const ALL_SEDES_N = navConfig[0].children;

  const tiendaCards = ALL_SEDES_N.flatMap(sede =>
    sede.items.map(t => {
      const k = `${sede.title}:${t}`;
      const st = stockData[k] || {};
      const total = Object.values(st).reduce((a, v) => a + (v || 0), 0);
      const criticos = Object.values(st).filter(v => (v || 0) < 8).length;
      return { tienda: t, sede, total, criticos };
    })
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Sora,sans-serif' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0c1a2e', margin: 0 }}>Sedes</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>Selecciona una tienda del menú lateral para ver el stock</p>
      </div>

      {ALL_SEDES_N.map(sede => {
        const sedeTiendas = tiendaCards.filter(tc => tc.sede.id === sede.id);
        return (
          <div key={sede.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{sede.title}</span>
              <div style={{ flex: 1, height: '1px', background: '#bae6fd' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
              {sedeTiendas.map(tc => (
                <div key={tc.tienda} style={{
                  background: 'white', borderRadius: '16px',
                  border: `2px solid ${tc.criticos > 0 ? '#fca5a5' : '#e0f2fe'}`,
                  padding: '20px 16px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(56,189,248,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" fill="none" stroke="#0284c7" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0c1a2e', lineHeight: 1.3 }}>{tc.tienda}</span>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: tc.criticos > 0 ? '#dc2626' : '#0284c7', lineHeight: 1 }}>{tc.total}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '-4px' }}>lentes en stock</div>
                  {tc.criticos > 0 && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                      ⚠ {tc.criticos} crítico{tc.criticos > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
