import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import navConfig from '../../navigation/navConfig';

/* ─── Sedes (sin Almacén) ────────────────────────────────────────── */
const ALL_SEDES  = navConfig[0].children.filter(s => s.id !== 'almacen');
const DAYS       = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const DAY_COLORS = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4'];

/* ─── Helpers de semana ──────────────────────────────────────────── */
function getWeekBounds(offset = 0) {
  const now = new Date();
  const dow = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  const fmt = d => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  return { label: `${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`, mon, sun };
}

function getDayIdx(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00');
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

/* ─── Exportar Excel ─────────────────────────────────────────────── */
function exportToExcel(data, tienda, sedeTitle, weekLabel, totalS, totalV, promedio, topTipo) {
  const esc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const filas = data.map(r => {
    const t = (parseFloat(r.costoMontura||0)+parseFloat(r.costoLunas||0)).toFixed(2);
    return `<tr><td>${esc(r.dia)}</td><td>${esc(r.nombre)}</td><td>${esc(r.luna)}</td><td>${esc(r.tipoLente)}</td><td>${r.costoMontura}</td><td>${r.costoLunas}</td><td style="font-weight:bold;color:#059669;">${t}</td><td>${esc(r.metodoPago||'—')}</td></tr>`;
  }).join('');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"><style>
body{font-family:Calibri,Arial;font-size:11pt;}table{border-collapse:collapse;width:100%;}
th{background:#0c1a2e;color:white;padding:8px 12px;text-align:left;}
td{padding:7px 12px;border-bottom:1px solid #e2e8f0;}tr:nth-child(even) td{background:#f8fafc;}
.titulo{font-size:16pt;font-weight:bold;color:#0c1a2e;}.subtitulo{font-size:11pt;color:#64748b;}
.resumen td{font-weight:bold;background:#eff6ff;font-size:12pt;}
.total-row td{background:#dcfce7;font-weight:bold;border-top:2px solid #059669;}
</style></head><body>
<p class="titulo">📊 Reporte Semanal de Ventas</p>
<p class="subtitulo">Tienda: ${esc(tienda)} | Sede: ${esc(sedeTitle)} | Semana: ${esc(weekLabel)}</p>
<table style="width:auto;margin-bottom:20px;">
  <tr class="resumen"><td>Total de ventas</td><td>${totalV} atenciones</td></tr>
  <tr class="resumen"><td>Ingresos totales</td><td>S/ ${totalS.toFixed(2)}</td></tr>
  <tr class="resumen"><td>Promedio por venta</td><td>S/ ${promedio}</td></tr>
  <tr class="resumen"><td>Tipo más vendido</td><td>${esc(topTipo[0])} (${topTipo[1]} ventas)</td></tr>
</table>
<table>
  <thead><tr><th>Día</th><th>Cliente</th><th>Luna</th><th>Tipo de Lente</th><th>Costo Montura</th><th>Costo Lunas</th><th>Total</th><th>Método de Pago</th></tr></thead>
  <tbody>${filas}</tbody>
  <tfoot><tr class="total-row"><td colspan="7">TOTAL DE LA SEMANA</td><td>S/ ${totalS.toFixed(2)}</td></tr></tfoot>
</table></body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `Reporte_${tienda.replace(/\s+/g,'_')}_${weekLabel.replace(/[^a-zA-Z0-9]/g,'_')}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Componente principal ───────────────────────────────────────── */
export default function Reporte() {
  const allVentas = useSelector(s => s.ventas.data);

  const [weekOff, setWeekOff]   = useState(0);
  const [sedeId, setSedeId]     = useState(ALL_SEDES[0].id);
  const [tienda, setTienda]     = useState(ALL_SEDES[0].items[0]);
  const [exporting, setExp]     = useState(false);

  const sedeObj = ALL_SEDES.find(s => s.id === sedeId);

  const handleSede = id => {
    setSedeId(id);
    setTienda(ALL_SEDES.find(s => s.id === id).items[0]);
  };

  /* Filtrar ventas reales por tienda + semana */
  const { label: weekLabel, mon, sun } = getWeekBounds(weekOff);

  const ventasFiltradas = allVentas.filter(v => {
    if (v.tienda !== tienda) return false;
    if (!v.fecha) return false;
    const d = new Date(v.fecha + 'T12:00:00');
    return d >= mon && d <= sun;
  });

  const data = ventasFiltradas.map(v => ({
    ...v,
    dia:    DAYS[getDayIdx(v.fecha)],
    diaIdx: getDayIdx(v.fecha),
  }));

  /* KPIs */
  const totalV   = data.length;
  const totalS   = data.reduce((s, r) => s + parseFloat(r.costoMontura||0) + parseFloat(r.costoLunas||0), 0);
  const promedio = totalV ? (totalS / totalV).toFixed(2) : '0.00';
  const tipoMap  = {};
  data.forEach(r => tipoMap[r.tipoLente] = (tipoMap[r.tipoLente] || 0) + 1);
  const topTipo  = Object.entries(tipoMap).sort((a,b) => b[1]-a[1])[0] || ['—', 0];

  /* Chart */
  const dayData = DAYS.map((d, i) => {
    const rows = data.filter(r => r.diaIdx === i);
    return { day: d, count: rows.length, total: rows.reduce((s,r) => s + parseFloat(r.costoMontura||0) + parseFloat(r.costoLunas||0), 0) };
  });
  const maxCnt = Math.max(...dayData.map(d => d.count), 1);

  const handleExport = () => {
    setExp(true);
    setTimeout(() => {
      exportToExcel(data, tienda, sedeObj.title, weekLabel, totalS, totalV, promedio, topTipo);
      setExp(false);
    }, 300);
  };

  /* Estilos */
  const card  = { background:'#fff', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' };
  const label = { fontSize:'11px', color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', display:'block', marginBottom:'7px' };
  const sel   = { border:'1.5px solid #e2e8f0', borderRadius:'9px', padding:'9px 13px', fontSize:'14px', color:'#0c1a2e', fontFamily:'Sora,sans-serif', cursor:'pointer', outline:'none', width:'100%', background:'#fff' };

  return (
    <div style={{ padding:'0', fontFamily:'Sora,sans-serif' }}>

      {/* ── Cabecera ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ margin:0, fontSize:'22px', color:'#0c1a2e', fontWeight:800 }}>📊 Reporte Semanal</h2>
          <p style={{ margin:'3px 0 0', color:'#64748b', fontSize:'13px' }}>Resumen de ventas por tienda</p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
          {/* Navegador de semana */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fff', padding:'8px 18px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
            <button onClick={() => setWeekOff(w => w - 1)}
              style={{ background:'#eff6ff', border:'none', cursor:'pointer', color:'#2563eb', padding:'6px 12px', borderRadius:'8px', fontSize:'18px', fontWeight:700, lineHeight:1 }}>‹</button>
            <span style={{ fontSize:'13px', fontWeight:700, color:'#374151', minWidth:'210px', textAlign:'center' }}>{weekLabel}</span>
            <button onClick={() => setWeekOff(w => w + 1)} disabled={weekOff >= 0}
              style={{ background: weekOff >= 0 ? '#f1f5f9' : '#eff6ff', border:'none', cursor: weekOff >= 0 ? 'not-allowed' : 'pointer', color: weekOff >= 0 ? '#cbd5e1' : '#2563eb', padding:'6px 12px', borderRadius:'8px', fontSize:'18px', fontWeight:700, lineHeight:1 }}>›</button>
          </div>

          {/* Exportar */}
          <button onClick={handleExport} disabled={exporting || totalV === 0}
            style={{ display:'flex', alignItems:'center', gap:'8px', background:(exporting||totalV===0)?'#94a3b8':'linear-gradient(135deg,#16a34a,#15803d)', color:'white', border:'none', borderRadius:'10px', padding:'10px 20px', fontSize:'13px', fontWeight:700, cursor:(exporting||totalV===0)?'not-allowed':'pointer', boxShadow:'0 2px 8px rgba(22,163,74,0.3)', fontFamily:'Sora,sans-serif' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display:'flex', gap:'16px', marginBottom:'24px', flexWrap:'wrap' }}>
        <div style={{ ...card, padding:'16px 20px', minWidth:'180px' }}>
          <label style={label}>Sede</label>
          <select value={sedeId} onChange={e => handleSede(e.target.value)} style={sel}>
            {ALL_SEDES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <div style={{ ...card, padding:'16px 20px', minWidth:'200px' }}>
          <label style={label}>Tienda</label>
          <select value={tienda} onChange={e => setTienda(e.target.value)} style={sel}>
            {sedeObj.items.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ ...card, padding:'16px 20px', flex:1, display:'flex', alignItems:'center', gap:'10px', minWidth:'200px' }}>
          <span style={{ fontSize:'26px' }}>📍</span>
          <div>
            <div style={{ fontWeight:800, color:'#0c1a2e', fontSize:'15px' }}>{tienda}</div>
            <div style={{ color:'#64748b', fontSize:'12px' }}>{sedeObj.title} · {weekLabel}</div>
            {totalV === 0 && (
              <div style={{ fontSize:'11px', color:'#f59e0b', marginTop:'3px' }}>Sin ventas registradas esta semana</div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display:'flex', gap:'16px', marginBottom:'24px', flexWrap:'wrap' }}>
        {[
          { label:'Total Ventas',     value: totalV,                   sub:'atenciones esta semana',       color:'#3b82f6', icon:'🛒' },
          { label:'Ingresos Totales', value:`S/ ${totalS.toFixed(2)}`, sub:'suma de todas las ventas',     color:'#10b981', icon:'💰' },
          { label:'Promedio / Venta', value:`S/ ${promedio}`,          sub:'ingreso promedio por cliente', color:'#f59e0b', icon:'📈' },
          { label:'Tipo más Vendido', value: topTipo[0],               sub:`${topTipo[1]} ventas`,         color:'#8b5cf6', icon:'🏆' },
        ].map(k => (
          <div key={k.label} style={{ ...card, flex:'1 1 180px', borderTop:`4px solid ${k.color}`, minWidth:'160px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <span style={{ fontSize:'11px', color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{k.label}</span>
              <span style={{ fontSize:'22px' }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: k.label === 'Tipo más Vendido' ? '20px' : '32px', fontWeight:800, color:'#0c1a2e', margin:'10px 0 4px', lineHeight:1.1 }}>
              {k.value}
            </div>
            <div style={{ fontSize:'12px', color:'#94a3b8' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Gráfico + Tabla ── */}
      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>

        {/* Gráfico */}
        <div style={{ ...card, flex:'0 0 360px', minWidth:'280px' }}>
          <div style={{ fontWeight:800, color:'#0c1a2e', fontSize:'15px', marginBottom:'4px' }}>Ventas por día</div>
          <div style={{ fontSize:'12px', color:'#94a3b8', marginBottom:'18px' }}>Número de atenciones</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'160px' }}>
            {dayData.map((d, i) => (
              <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color: d.count > 0 ? DAY_COLORS[i] : 'transparent' }}>{d.count}</div>
                <div title={`S/ ${d.total.toFixed(2)}`}
                  style={{ width:'100%', background: d.count > 0 ? `linear-gradient(180deg,${DAY_COLORS[i]}cc,${DAY_COLORS[i]})` : '#e2e8f0', borderRadius:'6px 6px 0 0', height:`${(d.count/maxCnt)*130+(d.count>0?8:4)}px`, transition:'height 0.4s ease' }} />
                <div style={{ fontSize:'11px', color:'#64748b', fontWeight:600 }}>{d.day}</div>
              </div>
            ))}
          </div>
          {/* Total semanal */}
          <div style={{ marginTop:'18px', borderTop:'1px solid #e2e8f0', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'12px', color:'#64748b', fontWeight:600 }}>Total de la semana</span>
            <span style={{ fontSize:'18px', fontWeight:800, color:'#059669' }}>S/ {totalS.toFixed(2)}</span>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ ...card, flex:1, minWidth:'300px', overflow:'hidden' }}>
          <div style={{ fontWeight:800, color:'#0c1a2e', fontSize:'15px', marginBottom:'4px' }}>Detalle de ventas</div>
          <div style={{ fontSize:'12px', color:'#94a3b8', marginBottom:'14px' }}>
            {totalV > 0 ? `${totalV} registros esta semana` : 'Sin ventas en esta tienda para la semana seleccionada'}
          </div>

          {totalV === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', gap:'10px', color:'#94a3b8', textAlign:'center' }}>
              <svg width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
              <p style={{ fontSize:'14px', margin:0, color:'#64748b' }}>No hay ventas registradas</p>
              <p style={{ fontSize:'12px', margin:0 }}>Registra ventas desde el módulo <strong style={{ color:'#0284c7' }}>Ventas</strong> seleccionando esta tienda</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto', maxHeight:'280px', overflowY:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead style={{ position:'sticky', top:0, zIndex:1 }}>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Día','Fecha','Cliente','Luna','Tipo de Lente','Montura','Lunas','Total','Método Pago'].map(h => (
                      <th key={h} style={{ padding:'9px 12px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:'11px', textTransform:'uppercase', borderBottom:'2px solid #e2e8f0', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(r => {
                    const t = (parseFloat(r.costoMontura||0) + parseFloat(r.costoLunas||0)).toFixed(2);
                    return (
                      <tr key={r.id} style={{ borderBottom:'1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'8px 12px' }}>
                          <span style={{ background:DAY_COLORS[r.diaIdx]+'22', color:DAY_COLORS[r.diaIdx], padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:700 }}>{r.dia}</span>
                        </td>
                        <td style={{ padding:'8px 12px', color:'#64748b', fontSize:'12px', whiteSpace:'nowrap' }}>{r.fecha || '—'}</td>
                        <td style={{ padding:'8px 12px', color:'#0c1a2e', fontWeight:600 }}>{r.nombre}</td>
                        <td style={{ padding:'8px 12px', color:'#64748b' }}>{r.luna}</td>
                        <td style={{ padding:'8px 12px' }}>
                          <span style={{ background:'#eff6ff', color:'#2563eb', padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:600 }}>{r.tipoLente}</span>
                        </td>
                        <td style={{ padding:'8px 12px', color:'#64748b' }}>S/ {r.costoMontura}</td>
                        <td style={{ padding:'8px 12px', color:'#64748b' }}>S/ {r.costoLunas}</td>
                        <td style={{ padding:'8px 12px', fontWeight:800, color:'#059669' }}>S/ {t}</td>
                        <td style={{ padding:'8px 12px' }}>
                          {r.metodoPago ? (
                            <span style={{
                              background: r.metodoPago==='yape' ? '#fdf4ff' : r.metodoPago==='visa' ? '#eff6ff' : '#f0fdf4',
                              color:      r.metodoPago==='yape' ? '#9333ea' : r.metodoPago==='visa' ? '#1d4ed8' : '#16a34a',
                              padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:700, textTransform:'capitalize'
                            }}>{r.metodoPago}</span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background:'#dcfce7', borderTop:'2px solid #059669' }}>
                    <td colSpan={8} style={{ padding:'10px 12px', fontWeight:800, color:'#065f46', fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      Total de la semana ({totalV} ventas)
                    </td>
                    <td style={{ padding:'10px 12px', fontWeight:800, color:'#059669', fontSize:'16px' }}>
                      S/ {totalS.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
