import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setVentas, addVenta, updateVenta } from '../../redux/ventasSlice';
import { decreaseStock } from '../../redux/stockSlice';
import { ventasAPI } from '../../services/api';
import navConfig from '../../navigation/navConfig';

/* ─── Sedes y tiendas ────────────────────────────────────────────── */
const ALL_SEDES    = navConfig[0].children;
const VENTAS_SEDES = navConfig[1].children;

const CATEGORIAS = [
  { id: 'metal',    label: 'Metal'              },
  { id: 'carey',    label: 'Carey'              },
  { id: 'acetato',  label: 'Acetato'            },
  { id: 'ninos',    label: 'Niños'              },
  { id: 'solares',  label: 'Solares'            },
  { id: 'lectura',  label: 'Lectura'            },
  { id: 'al-aire',  label: 'Al Aire'            },
  { id: 'liquidos', label: 'Líquidos'           },
  { id: 'contacto', label: 'Lentes de Contacto' },
];

const LUNAS = ['Blue Azul','Blue Verde','AR16','RxUv','Dippin','Fotocromatico','Orgánica','Digitales','Cristales'];
const TIPOS = ['Lejos','Cerca','Bifocal','Multifocal','Multifocal/Progresivo','Media Distancia'];
const PAGOS = ['yape','efectivo','visa'];

const pagoColors = {
  yape:     { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  efectivo: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  visa:     { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};

const totalCosto = (row) => (parseFloat(row.costoMontura || 0) + parseFloat(row.costoLunas || 0)).toFixed(2);
const rowId      = (row) => row._id || row.id;

/* ─── Exportar Excel ─────────────────────────────────────────────── */
function exportVentasExcel(rows, tienda, distrito) {
  const esc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const totalS = rows.reduce((a, r) => a + parseFloat(r.costoMontura||0) + parseFloat(r.costoLunas||0), 0);
  const filas  = rows.map(r => {
    const t = (parseFloat(r.costoMontura||0)+parseFloat(r.costoLunas||0)).toFixed(2);
    return `<tr><td>${esc(r.fecha||'—')}</td><td>${esc(r.nombre)}</td><td>${esc(r.categoriaId)}</td><td>${esc(r.luna)}</td><td>${esc(r.tipoLente)}</td><td>${r.costoMontura}</td><td>${r.costoLunas}</td><td style="font-weight:bold;color:#059669;">${t}</td><td>${esc(r.metodoPago||'—')}</td></tr>`;
  }).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"><style>
body{font-family:Calibri,Arial;font-size:11pt;}table{border-collapse:collapse;width:100%;}
th{background:#0c1a2e;color:white;padding:8px 12px;text-align:left;}
td{padding:7px 12px;border-bottom:1px solid #e2e8f0;}tr:nth-child(even) td{background:#f8fafc;}
.titulo{font-size:16pt;font-weight:bold;color:#0c1a2e;}.sub{font-size:11pt;color:#64748b;}
.total-row td{background:#dcfce7;font-weight:bold;border-top:2px solid #059669;}
</style></head><body>
<p class="titulo">📋 Registro de Ventas</p>
<p class="sub">Tienda: ${esc(tienda)} | Sede: ${esc(distrito)}</p>
<table>
  <thead><tr><th>Fecha</th><th>Paciente</th><th>Categoría</th><th>Luna</th><th>Tipo de Lente</th><th>Costo Montura</th><th>Costo Lunas</th><th>Total</th><th>Método de Pago</th></tr></thead>
  <tbody>${filas}</tbody>
  <tfoot><tr class="total-row"><td colspan="8">TOTAL</td><td>S/ ${totalS.toFixed(2)}</td></tr></tfoot>
</table></body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `Ventas_${tienda.replace(/\s+/g,'_')}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Icons ─────────────────────────────────────────────────────── */
const EyeIcon   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ChevL     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevR     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;
const CloseIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ─── Colores accent ventas (púrpura) ─────────────────────────── */
const AC = { main: '#7c3aed', light: '#ede9fe', mid: '#8b5cf6', border: '#ddd6fe', soft: '#f5f3ff' };

const emptyForm = (sedeId, tiendaName) => ({
  nombre: '', luna: LUNAS[0], tipoLente: TIPOS[0], descripcion: '',
  costoMontura: '', costoLunas: '',
  sedeId:     sedeId    || ALL_SEDES[0].id,
  tienda:     tiendaName || ALL_SEDES[0].items[0],
  categoriaId: CATEGORIAS[0].id,
  metodoPago: 'efectivo',
});

export default function Ventas() {
  const [params]  = useSearchParams();
  const dispatch  = useDispatch();
  const data      = useSelector(s => s.ventas.data);
  const token     = useSelector(s => s.auth.token);

  const distrito = params.get('d') || '';
  const tienda   = params.get('t') || '';

  const activeSede = ALL_SEDES.find(s => s.title === distrito);

  const [search, setSearch]     = useState('');
  const [perPage, setPerPage]   = useState(10);
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm]         = useState(emptyForm());
  const [saving, setSaving]     = useState(false);

  /* ── Cargar ventas desde el backend ─────────────────────────── */
  useEffect(() => {
    if (!token) return;
    ventasAPI.getAll()
      .then(rows => dispatch(setVentas(rows)))
      .catch(err => console.warn('Backend no disponible:', err.message));
  }, [token, dispatch]);

  const catLabel  = (id) => CATEGORIAS.find(c => c.id === id)?.label || id;
  const sedeLabel = (id) => ALL_SEDES.find(s => s.id === id)?.title || id;

  const openNew  = () => {
    setEditItem(null);
    setForm(emptyForm(activeSede?.id, tienda || undefined));
    setModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      nombre: item.nombre, luna: item.luna, tipoLente: item.tipoLente,
      descripcion: item.descripcion || '', costoMontura: item.costoMontura,
      costoLunas: item.costoLunas, sedeId: item.sedeId, tienda: item.tienda,
      categoriaId: item.categoriaId, metodoPago: item.metodoPago || 'efectivo',
    });
    setModal(true);
  };

  const sedeObj   = ALL_SEDES.find(s => s.id === form.sedeId) || ALL_SEDES[0];
  const formTotal = (parseFloat(form.costoMontura || 0) + parseFloat(form.costoLunas || 0)).toFixed(2);

  const handleSede = (sedeId) => {
    const newSede = ALL_SEDES.find(s => s.id === sedeId);
    setForm(prev => ({ ...prev, sedeId, tienda: newSede.items[0] }));
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        const updated = await ventasAPI.update(rowId(editItem), form);
        dispatch(updateVenta(updated));
      } else {
        const newVenta = await ventasAPI.create({
          ...form,
          sede:  sedeObj.title,
          fecha: new Date().toISOString().split('T')[0],
        });
        dispatch(decreaseStock({ key: `${sedeObj.title}:${form.tienda}`, catId: form.categoriaId }));
        dispatch(addVenta(newVenta));
      }
    } catch (err) {
      console.error('Error guardando venta:', err.message);
      /* Fallback local si el backend falla */
      if (!editItem) {
        dispatch(decreaseStock({ key: `${sedeObj.title}:${form.tienda}`, catId: form.categoriaId }));
        dispatch(addVenta({ id: Date.now(), ...form, fecha: new Date().toISOString().split('T')[0] }));
      }
    } finally {
      setSaving(false);
      setModal(false);
    }
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  /* ══════════════════════════════════════════════════════════════
     NIVEL 2 — Tienda seleccionada
  ══════════════════════════════════════════════════════════════ */
  if (tienda) {
    const tiendaRows    = data.filter(r => r.tienda === tienda);
    const filtered      = tiendaRows.filter(r => r.nombre.toLowerCase().includes(search.toLowerCase()));
    const totalPages    = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage      = Math.min(page, totalPages);
    const pageRows      = filtered.slice((safePage - 1) * perPage, safePage * perPage);

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
              {tiendaRows.length} venta{tiendaRows.length !== 1 ? 's' : ''} registrada{tiendaRows.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => exportVentasExcel(tiendaRows, tienda, distrito)}
              disabled={tiendaRows.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px', background: tiendaRows.length === 0 ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 12px rgba(22,163,74,0.3)', cursor: tiendaRows.length === 0 ? 'not-allowed' : 'pointer' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar Excel
            </button>
            <button style={s.newBtn} onClick={openNew}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
              Agregar Venta
            </button>
          </div>
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
              <input style={s.searchInput} placeholder="Buscar paciente..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Paciente</th>
                  <th style={s.th}>Categoría</th>
                  <th style={s.th}>Luna</th>
                  <th style={s.th}>Tipo de Lente</th>
                  <th style={s.th}>Costo Montura</th>
                  <th style={s.th}>Costo Lunas</th>
                  <th style={{ ...s.th, color: AC.main }}>Total</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Método de Pago</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length > 0 ? pageRows.map(row => (
                  <tr key={rowId(row)} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: '600', color: '#0c1a2e' }}>{row.nombre}</td>
                    <td style={s.td}><span style={s.badgeCat}>{catLabel(row.categoriaId)}</span></td>
                    <td style={s.td}><span style={s.badge}>{row.luna}</span></td>
                    <td style={s.td}><span style={s.badgeBlue}>{row.tipoLente}</span></td>
                    <td style={{ ...s.td, color: '#6b7280' }}>S/ {row.costoMontura}</td>
                    <td style={{ ...s.td, color: '#6b7280' }}>S/ {row.costoLunas}</td>
                    <td style={s.td}><span style={s.totalBadge}>S/ {totalCosto(row)}</span></td>
                    <td style={{ ...s.td, color: '#9ca3af', fontSize: '12px' }}>{row.fecha || '—'}</td>
                    <td style={s.td}>
                      {row.metodoPago ? (
                        <span style={{ background: pagoColors[row.metodoPago]?.bg || '#f3f4f6', color: pagoColors[row.metodoPago]?.color || '#374151', border: `1px solid ${pagoColors[row.metodoPago]?.border || '#e5e7eb'}`, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                          {row.metodoPago}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.actBtn} title="Ver" onClick={() => setViewItem(row)}><EyeIcon /></button>
                        <button style={{ ...s.actBtn, ...s.actEdit }} title="Editar" onClick={() => openEdit(row)}><EditIcon /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="10" style={s.empty}>Sin ventas registradas en esta tienda</td></tr>
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

        {modal && <VentaModal
          editItem={editItem} form={form} f={f}
          formTotal={formTotal} catLabel={catLabel} saving={saving}
          handleSave={handleSave} onClose={() => setModal(false)}
          CATEGORIAS={CATEGORIAS} LUNAS={LUNAS} TIPOS={TIPOS}
        />}
        {viewItem && <VentaViewModal item={viewItem} catLabel={catLabel} sedeLabel={sedeLabel} onClose={() => setViewItem(null)} />}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     NIVEL 1 — Sin tienda seleccionada: tarjetas por tienda
  ══════════════════════════════════════════════════════════════ */
  const tiendaCards = VENTAS_SEDES.flatMap(sede =>
    sede.items.map(t => {
      const rows  = data.filter(r => r.tienda === t);
      const total = rows.reduce((a, r) => a + parseFloat(r.costoMontura || 0) + parseFloat(r.costoLunas || 0), 0);
      return { tienda: t, sede, count: rows.length, total };
    })
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Sora,sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0c1a2e', margin: 0 }}>Ventas</h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>Selecciona una tienda del menú lateral para ver el detalle</p>
        </div>
      </div>

      {VENTAS_SEDES.map(sede => {
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
                <div key={tc.tienda}
                  style={{ background: 'white', borderRadius: '16px', border: `2px solid ${tc.count > 0 ? AC.border : '#e5e7eb'}`, padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 24px rgba(124,58,237,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: tc.count > 0 ? AC.light : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" fill="none" stroke={tc.count > 0 ? AC.main : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0c1a2e', lineHeight: 1.3 }}>{tc.tienda}</span>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: tc.count > 0 ? AC.main : '#d1d5db', lineHeight: 1 }}>{tc.count}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '-4px' }}>ventas</div>
                  {tc.count > 0 && (
                    <div style={{ background: AC.soft, color: AC.main, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, border: `1px solid ${AC.border}` }}>
                      S/ {tc.total.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {modal && <VentaModal
        editItem={editItem} form={form} f={f}
        sedeObj={sedeObj} formTotal={formTotal} saving={saving}
        catLabel={catLabel} handleSede={handleSede}
        handleSave={handleSave} onClose={() => setModal(false)}
        ALL_SEDES={ALL_SEDES} CATEGORIAS={CATEGORIAS} LUNAS={LUNAS} TIPOS={TIPOS}
      />}
      {viewItem && <VentaViewModal item={viewItem} catLabel={catLabel} sedeLabel={sedeLabel} onClose={() => setViewItem(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Sub-componentes
══════════════════════════════════════════════════════════════════ */
function VentaModal({ editItem, form, f, formTotal, catLabel, saving, handleSave, onClose, CATEGORIAS, LUNAS, TIPOS }) {
  const AC = { main: '#7c3aed', border: '#ddd6fe', soft: '#f5f3ff' };
  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, maxWidth: '560px' }}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>{editItem ? 'Editar Venta' : 'Agregar Nueva Venta'}</h3>
          <button style={s.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>
        <div style={{ ...s.modalBody, maxHeight: '70vh', overflowY: 'auto' }}>

          <div style={s.field}>
            <label style={s.fieldLabel}>Nombre del Paciente</label>
            <input style={s.fieldInput} placeholder="Ej: Juan Perez Lopez" value={form.nombre}
              onChange={e => f('nombre', e.target.value)}
              onFocus={e => e.target.style.borderColor = AC.main}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={s.field}>
            <label style={s.fieldLabel}>Categoría de Montura</label>
            <select style={s.fieldSelect} value={form.categoriaId} onChange={e => f('categoriaId', e.target.value)}>
              {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {!editItem && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: AC.main, background: AC.soft, padding: '5px 10px', borderRadius: '6px' }}>
                ℹ Al registrar, se descontará 1 unidad de <strong>{catLabel(form.categoriaId)}</strong> en <strong>{form.tienda}</strong>
              </div>
            )}
          </div>

          <div style={s.row2}>
            <div style={s.field}>
              <label style={s.fieldLabel}>Luna</label>
              <select style={s.fieldSelect} value={form.luna} onChange={e => f('luna', e.target.value)}>
                {LUNAS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Tipo de Lente</label>
              <select style={s.fieldSelect} value={form.tipoLente} onChange={e => f('tipoLente', e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.fieldLabel}>Descripción de la Compra</label>
            <input style={s.fieldInput} placeholder="Ej: Armazón metálico con lentes graduados" value={form.descripcion}
              onChange={e => f('descripcion', e.target.value)}
              onFocus={e => e.target.style.borderColor = AC.main}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={s.row2}>
            <div style={s.field}>
              <label style={s.fieldLabel}>Costo Montura (S/)</label>
              <input style={s.fieldInput} placeholder="Ej: 150.00" type="number" value={form.costoMontura}
                onChange={e => f('costoMontura', e.target.value)}
                onFocus={e => e.target.style.borderColor = AC.main}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Costo Lunas (S/)</label>
              <input style={s.fieldInput} placeholder="Ej: 100.00" type="number" value={form.costoLunas}
                onChange={e => f('costoLunas', e.target.value)}
                onFocus={e => e.target.style.borderColor = AC.main}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>

          {/* Método de pago */}
          <div style={s.field}>
            <label style={s.fieldLabel}>Método de Pago</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {PAGOS.map(m => {
                const pc = pagoColors[m];
                const active = form.metodoPago === m;
                return (
                  <button key={m} type="button" onClick={() => f('metodoPago', m)}
                    style={{ flex: 1, padding: '10px 6px', border: `2px solid ${active ? pc.border : '#e5e7eb'}`, borderRadius: '10px', background: active ? pc.bg : 'white', color: active ? pc.color : '#9ca3af', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize', fontFamily: "'Sora',sans-serif" }}>
                    {m === 'yape' ? '💜 Yape' : m === 'efectivo' ? '💵 Efectivo' : '💳 Visa'}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={s.totalPreview}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Costo Total</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: AC.main, fontFamily: "'Sora',sans-serif" }}>
              S/ {formTotal}
            </span>
          </div>

        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : (editItem ? 'Guardar Cambios' : 'Registrar Venta')}
          </button>
        </div>
      </div>
    </div>
  );
}

function VentaViewModal({ item, catLabel, sedeLabel, onClose }) {
  const AC    = { main: '#7c3aed', border: '#ddd6fe', soft: '#f5f3ff' };
  const total = (parseFloat(item.costoMontura || 0) + parseFloat(item.costoLunas || 0)).toFixed(2);
  const pc    = pagoColors[item.metodoPago] || pagoColors.efectivo;
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Detalle de Venta</h3>
          <button style={s.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>
        <div style={s.modalBody}>
          <div style={s.viewRow}><span style={s.viewLabel}>Paciente</span><span style={s.viewValue}>{item.nombre}</span></div>
          <div style={s.row2}>
            <div style={s.viewRow}><span style={s.viewLabel}>Sede</span><span style={s.viewValue}>{sedeLabel(item.sedeId)}</span></div>
            <div style={s.viewRow}><span style={s.viewLabel}>Tienda</span><span style={s.viewValue}>{item.tienda}</span></div>
          </div>
          <div style={s.viewRow}><span style={s.viewLabel}>Categoría</span><span style={s.viewValue}>{catLabel(item.categoriaId)}</span></div>
          <div style={s.row2}>
            <div style={s.viewRow}><span style={s.viewLabel}>Luna</span><span style={s.viewValue}>{item.luna}</span></div>
            <div style={s.viewRow}><span style={s.viewLabel}>Tipo de Lente</span><span style={s.viewValue}>{item.tipoLente}</span></div>
          </div>
          <div style={s.viewRow}><span style={s.viewLabel}>Descripción</span><span style={s.viewValue}>{item.descripcion || '—'}</span></div>
          <div style={s.row2}>
            <div style={s.viewRow}><span style={s.viewLabel}>Costo Montura</span><span style={{ ...s.viewValue, color: '#6b7280' }}>S/ {item.costoMontura}</span></div>
            <div style={s.viewRow}><span style={s.viewLabel}>Costo Lunas</span><span style={{ ...s.viewValue, color: '#6b7280' }}>S/ {item.costoLunas}</span></div>
          </div>
          <div style={s.viewRow}>
            <span style={s.viewLabel}>Método de Pago</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: pc.color, textTransform: 'capitalize' }}>
              {item.metodoPago === 'yape' ? '💜 Yape' : item.metodoPago === 'efectivo' ? '💵 Efectivo' : item.metodoPago === 'visa' ? '💳 Visa' : '—'}
            </span>
          </div>
          <div style={{ ...s.viewRow, background: AC.soft, border: `1.5px solid ${AC.border}` }}>
            <span style={{ ...s.viewLabel, color: AC.main }}>Costo Total</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: AC.main, fontFamily: "'Sora',sans-serif" }}>S/ {total}</span>
          </div>
          <div style={s.viewRow}><span style={s.viewLabel}>Fecha</span><span style={s.viewValue}>{item.fecha || '—'}</span></div>
        </div>
        <div style={s.modalFooter}>
          <button style={s.saveBtn} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const AC2 = { main: '#7c3aed', mid: '#8b5cf6', border: '#ddd6fe', soft: '#f5f3ff' };
const s = {
  newBtn:    { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: `linear-gradient(135deg,${AC2.mid},${AC2.main})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', fontFamily: "'Sora',sans-serif", boxShadow: `0 6px 16px rgba(139,92,246,0.35)`, cursor: 'pointer' },
  card:       { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' },
  controls:   { padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '12px' },
  showRow:    { display: 'flex', alignItems: 'center', gap: '8px' },
  showLabel:  { fontSize: '13px', color: '#6b7280' },
  select:     { padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', cursor: 'pointer' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '11px', color: '#9ca3af', pointerEvents: 'none' },
  searchInput:{ padding: '9px 16px 9px 34px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', width: '240px' },
  table:  { width: '100%', borderCollapse: 'collapse' },
  thead:  { background: AC2.soft, borderBottom: '2px solid #e5e7eb' },
  th:     { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#374151', letterSpacing: '0.7px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  tr:     { borderBottom: '1px solid #f3f4f6' },
  td:     { padding: '13px 16px', fontSize: '13.5px', verticalAlign: 'middle' },
  empty:  { padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' },
  badge:      { background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeBlue:  { background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeCat:   { background: '#f3f4f6', color: '#374151', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  totalBadge: { background: AC2.soft, color: AC2.main, border: `1.5px solid ${AC2.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', fontFamily: "'Sora',sans-serif" },
  actions: { display: 'flex', gap: '4px' },
  actBtn:  { width: '30px', height: '30px', border: 'none', borderRadius: '7px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  actEdit: { background: '#fef9c3', color: '#ca8a04' },
  pagination: { padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', borderTop: '1px solid #f3f4f6' },
  pgBtn:      { minWidth: '34px', height: '34px', padding: '0 6px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', fontSize: '13px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  pgActive:   { background: AC2.main, borderColor: AC2.main, color: 'white' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:      { background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' },
  modalHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' },
  modalTitle: { fontFamily: "'Sora',sans-serif", fontSize: '17px', fontWeight: '700', color: '#0c1a2e', margin: 0 },
  closeBtn:   { width: '32px', height: '32px', border: 'none', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' },
  modalBody:  { padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' },
  modalFooter:{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #f3f4f6' },
  row2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field:      { marginBottom: '14px' },
  fieldLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' },
  fieldInput: { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  fieldSelect:{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
  totalPreview:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: AC2.soft, borderRadius: '12px', border: `1.5px solid ${AC2.border}`, marginTop: '4px' },
  cancelBtn: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', fontSize: '14px', fontWeight: '600', color: '#6b7280', cursor: 'pointer' },
  saveBtn:   { padding: '10px 20px', border: 'none', borderRadius: '10px', background: `linear-gradient(135deg,${AC2.mid},${AC2.main})`, color: 'white', fontSize: '14px', fontWeight: '600', fontFamily: "'Sora',sans-serif", cursor: 'pointer', boxShadow: `0 4px 12px rgba(124,58,237,0.3)` },
  viewRow:   { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', padding: '14px', background: AC2.soft, borderRadius: '10px', border: `1px solid ${AC2.border}` },
  viewLabel: { fontSize: '11px', fontWeight: '700', color: AC2.main, textTransform: 'uppercase', letterSpacing: '0.8px' },
  viewValue: { fontSize: '15px', color: '#0c1a2e', fontWeight: '500' },
};
