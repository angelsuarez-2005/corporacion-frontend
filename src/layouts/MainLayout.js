import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import navConfig from '../navigation/navConfig';

const icons = {
  store:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l1-6h16l1 6"/><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/><path d="M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/></svg>,
  dollar: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  eye:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  chart:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
};

/* Íconos por distrito — strip sufijos como '-v' para reutilizar */
const distIcons = {
  ves:     <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  surco:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  lurin:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  manchay: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  almacen: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
};

const getDistIcon = (id) => distIcons[id.replace(/-v$/, '')] || distIcons.ves;

const StoreIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ChevIcon = ({ open, size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* Colores de acento por sección */
const ACCENT = {
  sedes:       { active: '#0284c7', activeBg: '#e0f2fe', distBg: '#f0f9ff', dot: '#38bdf8' },
  ventas:      { active: '#7c3aed', activeBg: '#ede9fe', distBg: '#f5f3ff', dot: '#8b5cf6' },
  consultorio: { active: '#059669', activeBg: '#d1fae5', distBg: '#ecfdf5', dot: '#10b981' },
};

export default function MainLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useSelector(s => s.auth.user);
  const isMobile  = () => window.innerWidth <= 768;

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const [openItems, setOpenItems]     = useState({ sedes: true });
  const [openDists, setOpenDists]     = useState({});

  const toggleItem = (id) => setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleDist = (id) => setOpenDists(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => { if (isMobile()) setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    const fn = () => isMobile() ? setSidebarOpen(false) : setSidebarOpen(true);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const urlParams  = new URLSearchParams(location.search);
  const activeD    = urlParams.get('d') || '';
  const activeT    = urlParams.get('t') || '';
  const activeTKey = activeD && activeT ? `${activeD}:${activeT}` : '';

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const isActive     = (path) => path && location.pathname === path;
  const initials     = user?.name ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'U';

  /* Filtrar nav según rol: Vendedor solo ve Ventas y Consultorio */
  const isVendedor = user?.role === 'Vendedor';
  const visibleNav = navConfig.filter(item =>
    !isVendedor || item.id === 'ventas' || item.id === 'consultorio'
  );

  return (
    <div className="layout">
      <div className={`sidebar-overlay ${sidebarOpen && isMobile() ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">&#x1F453;</div>
          <div>
            <span className="brand-name">Corporacion</span>
            <span className="brand-tag">· Opticas</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleNav.map(item => {

            /* ── Acordeón genérico (Sedes, Ventas, etc.) ── */
            if (item.children) {
              const isOpen   = !!openItems[item.id];
              const accent   = ACCENT[item.id] || ACCENT.sedes;
              const isOnPath = location.pathname === item.path;

              return (
                <div key={item.id}>
                  <div
                    className={`nav-item ${isOnPath ? 'active' : ''}`}
                    style={{ justifyContent: 'space-between' }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="nav-icon">{icons[item.icon]}</span>
                      <span className="nav-label">{item.title}</span>
                    </span>
                    <ChevIcon open={isOpen} color="rgba(255,255,255,0.7)" />
                  </div>

                  {isOpen && (
                    <div style={{ background: 'white', borderRadius: '10px', margin: '2px 8px 6px 8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                      {item.children.map((dist, dIdx) => {
                        const distOpen = !!openDists[dist.id];
                        return (
                          <div key={dist.id} style={{ borderBottom: dIdx < item.children.length - 1 ? '1px solid #f3f4f6' : 'none' }}>

                            {/* Fila distrito */}
                            <div
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', cursor: 'pointer', background: distOpen ? accent.distBg : 'white', transition: 'background 0.15s', userSelect: 'none' }}
                              onClick={() => toggleDist(dist.id)}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: distOpen ? accent.active : '#374151' }}>
                                <span style={{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, background: distOpen ? accent.activeBg : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: distOpen ? accent.active : '#6b7280' }}>
                                  {getDistIcon(dist.id)}
                                </span>
                                <span style={{ fontSize: '12.5px', fontWeight: '600' }}>{dist.title}</span>
                              </span>
                              <ChevIcon open={distOpen} size={11} color={distOpen ? accent.active : '#9ca3af'} />
                            </div>

                            {/* Tiendas */}
                            {distOpen && (
                              <div style={{ background: '#f8fafc', borderTop: `1px solid ${accent.distBg}` }}>
                                {dist.items.map((tienda, idx) => {
                                  const tKey  = `${dist.title}:${tienda}`;
                                  const isAct = activeTKey === tKey && location.pathname === item.path;
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => navigate(`${item.path}?d=${encodeURIComponent(dist.title)}&t=${encodeURIComponent(tienda)}`)}
                                      style={{ padding: '7px 12px 7px 46px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', color: isAct ? accent.active : '#4b5563', fontWeight: isAct ? '600' : '400', background: isAct ? accent.activeBg : 'transparent', borderLeft: isAct ? `3px solid ${accent.dot}` : '3px solid transparent', borderBottom: idx < dist.items.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'all 0.12s' }}
                                      onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = accent.distBg; }}
                                      onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                      <StoreIcon />
                                      {tienda}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            /* ── Item normal ── */
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{icons[item.icon]}</span>
                <span className="nav-label">{item.title}</span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">{icons.logout}</span>
            <span className="nav-label">Cerrar Sesion</span>
          </div>
        </div>
      </aside>

      <div className={`main-wrapper ${sidebarOpen ? '' : 'full'}`}>
        <header className="topbar">
          <button className="topbar-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="topbar-right">
            <div className="topbar-user-info">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-role">{user?.role || 'Operador'}</span>
            </div>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>
        <main className="page-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
