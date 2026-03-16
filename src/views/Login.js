import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../redux/authSlice';
import { authAPI } from '../services/api';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.login(form.username, form.password);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      navigate('/');
    } catch (err) {
      const msg = err.message.includes('fetch')
        ? 'No se puede conectar al servidor. Verifica que el backend esté corriendo.'
        : err.message || 'Usuario o contraseña incorrectos';
      dispatch(loginFailure(msg));
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* LADO IZQUIERDO */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.circle1} />
          <div style={styles.circle2} />

          {/* Ilustracion */}
          <div style={styles.illustration}>
            <div style={styles.screen}>
              <div style={styles.screenHeader}>
                <div style={styles.screenDot} />
                <div style={{...styles.screenDot, background:'#38bdf8'}} />
                <div style={{...styles.screenDot, background:'#0284c7'}} />
              </div>
              <div style={styles.screenBody}>
                <div style={styles.chartBar}>
                  {[60,80,45,90,70,55,85,40,75,65].map((h,i) => (
                    <div key={i} style={{...styles.bar, height:`${h}%`, background: i%2===0 ? '#38bdf8' : '#0284c7', opacity: 0.7+i*0.02}} />
                  ))}
                </div>
                <div style={styles.chartLine}>
                  <svg width="100%" height="60" viewBox="0 0 200 60">
                    <polyline points="0,50 40,30 80,40 120,15 160,25 200,10" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Lentes flotantes */}
            <div style={styles.glassFloat1}>🕶️</div>
            <div style={styles.glassFloat2}>👓</div>

            {/* Personas */}
            <div style={styles.personsRow}>
              {['&#x1F468;','&#x1F469;','&#x1F468;&#x200D;&#x1F4BC;'].map((p,i) => (
                <div key={i} style={{...styles.person, animationDelay:`${i*0.3}s`}} dangerouslySetInnerHTML={{__html: p}} />
              ))}
            </div>
          </div>

          <h2 style={styles.leftTitle}>Corporacion Opticas</h2>
          <p style={styles.leftSub}>Sistema integral de gestion para opticas — sedes, ventas, mercaderia y consultorio</p>
        </div>
      </div>

      {/* LADO DERECHO */}
      <div style={styles.right}>
        <div style={styles.formCard}>

          <div style={styles.formLogo}>
            <div style={styles.logoBox}>👓</div>
            <div>
              <div style={styles.formBrand}>Corporacion Opticas</div>
              <div style={styles.formBrandSub}>Sistema de Opticas</div>
            </div>
          </div>

          <h2 style={styles.formTitle}>Iniciar sesion</h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Usuario</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Tu usuario..."
                style={styles.input}
                onFocus={e => e.target.style.borderColor='#38bdf8'}
                onBlur={e => e.target.style.borderColor='#e5e7eb'}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Clave</label>
                <span style={styles.forgot}>Olvidaste tu clave?</span>
              </div>
              <div style={styles.passWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tu contrasena..."
                  style={{...styles.input, paddingRight:'44px'}}
                  onFocus={e => e.target.style.borderColor='#38bdf8'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'}
                  required
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? <span style={styles.spinner} /> : 'Iniciar sesion'}
            </button>
          </form>

          <div style={styles.hint}>
            Usuarios: <strong>luisangel</strong> · <strong>karen</strong> · <strong>trabajadora</strong> · <strong>jaspers</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display:'flex', minHeight:'100vh', fontFamily:"'DM Sans', sans-serif", background:'#f8faff' },

  /* IZQUIERDA */
  left: { flex:1, background:'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 60%, #bae6fd 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:'40px' },
  leftInner: { position:'relative', zIndex:1, textAlign:'center', maxWidth:'480px' },
  circle1: { position:'absolute', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(56,189,248,0.1)', top:'-100px', right:'-100px' },
  circle2: { position:'absolute', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(2,132,199,0.08)', bottom:'-80px', left:'-80px' },

  illustration: { position:'relative', marginBottom:'32px' },
  screen: { background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 20px 60px rgba(56,189,248,0.2)', marginBottom:'16px', border:'1px solid #e0f2fe' },
  screenHeader: { display:'flex', gap:'6px', marginBottom:'14px' },
  screenDot: { width:'10px', height:'10px', borderRadius:'50%', background:'#e5e7eb' },
  screenBody: { display:'flex', flexDirection:'column', gap:'8px' },
  chartBar: { display:'flex', alignItems:'flex-end', gap:'6px', height:'80px', padding:'8px' },
  bar: { flex:1, borderRadius:'4px 4px 0 0' },
  chartLine: { padding:'0 8px' },

  glassFloat1: { position:'absolute', top:'-10px', right:'20px', fontSize:'32px', animation:'float 3s ease-in-out infinite' },
  glassFloat2: { position:'absolute', bottom:'20px', left:'10px', fontSize:'24px', animation:'float 3s ease-in-out infinite', animationDelay:'1.5s' },

  personsRow: { display:'flex', justifyContent:'center', gap:'16px', marginTop:'16px' },
  person: { fontSize:'36px', animation:'bounce 2s ease-in-out infinite' },

  leftTitle: { fontFamily:"'Sora', sans-serif", fontSize:'26px', fontWeight:'700', color:'#0c1a2e', marginBottom:'10px' },
  leftSub: { fontSize:'15px', color:'#4b5563', lineHeight:'1.6' },

  /* DERECHA */
  right: { width:'420px', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', background:'white', boxShadow:'-4px 0 30px rgba(0,0,0,0.06)' },
  formCard: { width:'100%' },

  formLogo: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'32px' },
  logoBox: { width:'46px', height:'46px', background:'linear-gradient(135deg, #38bdf8, #0284c7)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', boxShadow:'0 6px 16px rgba(56,189,248,0.35)' },
  formBrand: { fontFamily:"'Sora', sans-serif", fontSize:'16px', fontWeight:'700', color:'#0c1a2e' },
  formBrandSub: { fontSize:'11px', color:'#0284c7', fontWeight:'600', letterSpacing:'1px', textTransform:'uppercase' },

  formTitle: { fontFamily:"'Sora', sans-serif", fontSize:'22px', fontWeight:'700', color:'#0c1a2e', marginBottom:'28px' },

  fieldGroup: { marginBottom:'18px' },
  labelRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'7px' },
  label: { fontSize:'13px', fontWeight:'600', color:'#374151' },
  forgot: { fontSize:'12px', color:'#0284c7', cursor:'pointer' },
  input: { width:'100%', padding:'12px 16px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', background:'#f9fafb', color:'#0c1a2e', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' },

  passWrap: { position:'relative' },
  eyeBtn: { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', fontSize:'16px', cursor:'pointer', padding:'0' },

  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', textAlign:'center', marginBottom:'16px' },

  submitBtn: { width:'100%', padding:'13px', background:'linear-gradient(135deg, #38bdf8, #0284c7)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'600', fontFamily:"'Sora', sans-serif", cursor:'pointer', boxShadow:'0 8px 20px rgba(56,189,248,0.35)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', marginTop:'8px' },

  spinner: { width:'18px', height:'18px', border:'2.5px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' },

  hint: { textAlign:'center', marginTop:'20px', fontSize:'12px', color:'#9ca3af' },
};