import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import navConfig from '../../navigation/navConfig';
import { consulAPI } from '../../services/api';

/* ─── Tiendas (sin Almacén) ──────────────────────────────────────── */
const CONSUL_SEDES = navConfig[0].children.filter(s => s.id !== 'almacen');

/* ─── Accent color (verde esmeralda) ─────────────────────────────── */
const AC = { main: '#059669', light: '#d1fae5', mid: '#10b981', border: '#a7f3d0', soft: '#ecfdf5' };

const EyeIcon   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const ChevL     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevR     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;
const CloseIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function Consultorio() {
  const [params]         = useSearchParams();
  const [data, setData]  = useState([]);
  const [search, setSearch]       = useState('');
  const [perPage, setPerPage]     = useState(10);
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [viewItem, setViewItem]   = useState(null);
  const [form, setForm]           = useState({ nombre: '', receta: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const distrito = params.get('d') || '';
  const tienda   = params.get('t') || '';
  const today    = new Date().toISOString().split('T')[0];

  /* Cargar pacientes desde MongoDB al montar */
  useEffect(() => {
    consulAPI.getAll()
      .then(pacientes => setData(pacientes))
      .catch(() => {/* sin conexión */});
  }, []);

  const openNew  = () => { setEditItem(null); setForm({ nombre: '', receta: '' }); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ nombre: item.nombre, receta: item.receta }); setModal(true); };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.receta.trim()) return;
    try {
      if (editItem) {
        const updated = await consulAPI.update(editItem._id || editItem.id, form);
        setData(data.map(d => (d._id || d.id) === (editItem._id || editItem.id) ? updated : d));
      } else {
        const nuevo = await consulAPI.create({ ...form, fecha: today, tienda: tienda || 'General' });
        setData([nuevo, ...data]);
      }
    } catch {
      /* fallback local si el backend no responde */
      if (editItem) {
        setData(data.map(d => (d._id || d.id) === (editItem._id || editItem.id) ? { ...d, ...form } : d));
      } else {
        setData([{ id: Date.now(), ...form, fecha: today, tienda: tienda || 'General' }, ...data]);
      }
    }
    setModal(false);
  };

  const handleDelete = async (item) => {
    try {
      await consulAPI.delete(item._id || item.id);
    } catch {/* fallo silencioso */}
    setData(data.filter(d => (d._id || d.id) !== (item._id || item.id)));
    setDeleteConfirm(null);
  };

  /* ══════════════════════════════════════════════════════════
     NIVEL 2 — Tienda seleccionada
  ══════════════════════════════════════════════════════════ */
  if (tienda) {
    const tiendaRows = data.filter(r => r.tienda === tienda || r.tienda === tienda);
    const filtered   = tiendaRows.filter(r => r.nombre.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage   = Math.min(page, totalPages);
    const pageRows   = filtered.slice((safePage - 1) * perPage, safePage * perPage);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Sora,sans-serif' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
              {distrito} ›&nbsp;<span style={{ color: AC.main, fontWeight: 700 }}>{tienda}</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0c1a2e', margin: 0 }}>{tienda}</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>
              {tiendaRows.length} paciente{tiendaRows.length !== 1 ? 's' : ''} registrado{tiendaRows.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button style={s.newBtn} onClick={openNew}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
            Nuevo Paciente
          </button>
        </div>

        {/* Tabla */}
        <div style={s.card}>
          <div style={s.controls}>
            <div style={s.showRow}>
              <span style={s.showLabel}>Mostrar</span>
              <select style={s.select} value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
              <span style={s.showLabel}>registros</span>
            </div>
            <div style={s.searchWrap}>
              <svg style={s.searchIcon} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input style={s.searchInput} placeholder="Buscar paciente..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Nombre del Paciente</th>
                  <th style={s.th}>Receta Médica</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length > 0 ? pageRows.map(row => (
                  <tr key={row._id || row.id} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: '500', color: '#0c1a2e' }}>{row.nombre}</td>
                    <td style={{ ...s.td, color: '#4b5563' }}>{row.receta}</td>
                    <td style={{ ...s.td, color: '#9ca3af', fontSize: '13px' }}>{row.fecha ? row.fecha.split('T')[0] : ''}</td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.actBtn} title="Ver" onClick={() => setViewItem(row)}><EyeIcon /></button>
                        <button style={{ ...s.actBtn, ...s.actEdit }} title="Editar" onClick={() => openEdit(row)}><EditIcon /></button>
                        <button style={{ ...s.actBtn, ...s.actDelete }} title="Eliminar" onClick={() => setDeleteConfirm(row)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={s.empty}>Sin pacientes registrados en esta tienda</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={s.pagination}>
            <button style={s.pgBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><ChevL /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} style={{ ...s.pgBtn, ...(n === safePage ? s.pgActive : {}) }} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button style={s.pgBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><ChevR /></button>
          </div>
        </div>

        {modal && <PacienteModal editItem={editItem} form={form} setForm={setForm} today={today} handleSave={handleSave} onClose={() => setModal(false)} />}
        {viewItem && <PacienteViewModal item={viewItem} onClose={() => setViewItem(null)} />}
        {deleteConfirm && <DeleteModal item={deleteConfirm} onConfirm={() => handleDelete(deleteConfirm)} onClose={() => setDeleteConfirm(null)} />}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     NIVEL 1 — Sin tienda: tarjetas por tienda
  ══════════════════════════════════════════════════════════ */
  const tiendaCards = CONSUL_SEDES.flatMap(sede =>
    sede.items.map(t => ({ tienda: t, sede, count: data.filter(r => r.tienda === t || r.tienda === t).length }))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Sora,sans-serif' }}>

      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0c1a2e', margin: 0 }}>Consultorio</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>Selecciona una tienda del menú lateral para ver el detalle</p>
      </div>

      {CONSUL_SEDES.map(sede => {
        const sedeTiendas = tiendaCards.filter(tc => tc.sede.id === sede.id);
        return (
          <div key={sede.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: AC.mid, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: AC.main, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{sede.title}</span>
              <div style={{ flex: 1, height: '1px', background: AC.border }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
              {sedeTiendas.map(tc => (
                <div key={tc.tienda} style={{
                  background: 'white', borderRadius: '16px',
                  border: `2px solid ${tc.count > 0 ? AC.border : '#e5e7eb'}`,
                  padding: '20px 16px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(5,150,105,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: tc.count > 0 ? AC.light : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" fill="none" stroke={tc.count > 0 ? AC.main : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0c1a2e', lineHeight: 1.3 }}>{tc.tienda}</span>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: tc.count > 0 ? AC.main : '#d1d5db', lineHeight: 1 }}>{tc.count}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '-4px' }}>pacientes</div>
                  {tc.count > 0 && (
                    <div style={{ background: AC.soft, color: AC.main, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, border: `1px solid ${AC.border}` }}>
                      activos
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

/* ── Sub-modales ─────────────────────────────────────────────────── */
function PacienteModal({ editItem, form, setForm, today, handleSave, onClose }) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>{editItem ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
          <button style={s.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>
        <div style={s.modalBody}>
          <div style={s.field}>
            <label style={s.fieldLabel}>Nombre del Paciente</label>
            <input style={s.fieldInput} placeholder="Ej: Juan Perez Lopez" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              onFocus={e => e.target.style.borderColor = AC.main}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Receta Médica</label>
            <input style={s.fieldInput} placeholder="Ej: OD: -2.50 / OI: -1.75" value={form.receta}
              onChange={e => setForm({ ...form, receta: e.target.value })}
              onFocus={e => e.target.style.borderColor = AC.main}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Fecha de Registro</label>
            <input style={{ ...s.fieldInput, background: '#f3f4f6', color: '#9ca3af' }} value={editItem ? editItem.fecha : today} disabled />
          </div>
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button style={s.saveBtn} onClick={handleSave}>{editItem ? 'Guardar Cambios' : 'Registrar Paciente'}</button>
        </div>
      </div>
    </div>
  );
}

function PacienteViewModal({ item, onClose }) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Detalle del Paciente</h3>
          <button style={s.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>
        <div style={s.modalBody}>
          <div style={s.viewRow}><span style={s.viewLabel}>Nombre</span><span style={s.viewValue}>{item.nombre}</span></div>
          <div style={s.viewRow}><span style={s.viewLabel}>Receta Médica</span><span style={s.viewValue}>{item.receta}</span></div>
          <div style={s.viewRow}><span style={s.viewLabel}>Tienda</span><span style={s.viewValue}>{item.tienda}</span></div>
          <div style={s.viewRow}><span style={s.viewLabel}>Fecha de Registro</span><span style={s.viewValue}>{item.fecha}</span></div>
        </div>
        <div style={s.modalFooter}>
          <button style={s.saveBtn} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ item, onConfirm, onClose }) {
  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, maxWidth: '380px' }}>
        <div style={s.modalHeader}>
          <h3 style={{ ...s.modalTitle, color: '#dc2626' }}>Eliminar Paciente</h3>
          <button style={s.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>
        <div style={s.modalBody}>
          <p style={{ fontSize: '14px', color: '#4b5563', textAlign: 'center', padding: '8px 0' }}>
            ¿Estás seguro de eliminar a <strong style={{ color: '#0c1a2e' }}>{item.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button style={{ ...s.saveBtn, background: '#ef4444', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }} onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  newBtn:    { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: `linear-gradient(135deg,${AC.mid},${AC.main})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', fontFamily: "'Sora',sans-serif", boxShadow: `0 6px 16px rgba(16,185,129,0.35)`, cursor: 'pointer' },
  card:       { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' },
  controls:   { padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '12px' },
  showRow:    { display: 'flex', alignItems: 'center', gap: '8px' },
  showLabel:  { fontSize: '13px', color: '#6b7280' },
  select:     { padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', cursor: 'pointer' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '11px', color: '#9ca3af', pointerEvents: 'none' },
  searchInput:{ padding: '9px 16px 9px 34px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', width: '240px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: AC.soft, borderBottom: '2px solid #e5e7eb' },
  th:    { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#374151', letterSpacing: '0.7px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  tr:    { borderBottom: '1px solid #f3f4f6' },
  td:    { padding: '13px 16px', fontSize: '13.5px', verticalAlign: 'middle' },
  empty: { padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' },
  actions: { display: 'flex', gap: '4px' },
  actBtn:   { width: '30px', height: '30px', border: 'none', borderRadius: '7px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  actEdit:  { background: '#fef9c3', color: '#ca8a04' },
  actDelete:{ background: '#fee2e2', color: '#dc2626' },
  pagination: { padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', borderTop: '1px solid #f3f4f6' },
  pgBtn:    { minWidth: '34px', height: '34px', padding: '0 6px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', fontSize: '13px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  pgActive: { background: AC.main, borderColor: AC.main, color: 'white' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:      { background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' },
  modalHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' },
  modalTitle: { fontFamily: "'Sora',sans-serif", fontSize: '17px', fontWeight: '700', color: '#0c1a2e', margin: 0 },
  closeBtn:   { width: '32px', height: '32px', border: 'none', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' },
  modalBody:  { padding: '24px' },
  modalFooter:{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #f3f4f6' },
  field:      { marginBottom: '18px' },
  fieldLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' },
  fieldInput: { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  cancelBtn:  { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', fontSize: '14px', fontWeight: '600', color: '#6b7280', cursor: 'pointer' },
  saveBtn:    { padding: '10px 20px', border: 'none', borderRadius: '10px', background: `linear-gradient(135deg,${AC.mid},${AC.main})`, color: 'white', fontSize: '14px', fontWeight: '600', fontFamily: "'Sora',sans-serif", cursor: 'pointer', boxShadow: `0 4px 12px rgba(16,185,129,0.3)` },
  viewRow:    { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', padding: '14px', background: AC.soft, borderRadius: '10px', border: `1px solid ${AC.border}` },
  viewLabel:  { fontSize: '11px', fontWeight: '700', color: AC.main, textTransform: 'uppercase', letterSpacing: '0.8px' },
  viewValue:  { fontSize: '15px', color: '#0c1a2e', fontWeight: '500' },
};
