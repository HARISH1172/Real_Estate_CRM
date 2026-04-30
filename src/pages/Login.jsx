import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const Login = () => {
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email address is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // AuthController: POST /api/auth/login → AuthResponseDTO { token, name, email, role, ... }
      const user = await login({ email: form.email, password: form.password });
      toast.success(`Welcome back, ${user.name}!`);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', background: '#f5f6fa' }}>

      {/* ── Left decorative panel ── */}
      <div className="login-left" style={{
        flex: '0 0 460px',
        background: 'linear-gradient(160deg,#0f1923 0%,#1a3c5e 60%,#2d5f8a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        {[320, 200].map((s, i) => (
          <div key={i} style={{ position: 'absolute', top: -80 + i*40, right: -80 + i*40, width: s, height: s, borderRadius: '50%', border: `1px solid rgba(255,255,255,${0.06 + i*0.02})` }} />
        ))}
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: 100, right: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(232,168,56,0.10)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#e8a838,#c8882a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} color="white" />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'white' }}>EstateFlow</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CRM Platform</p>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
            Real Estate<br /><span style={{ color: '#e8a838' }}>Intelligence</span><br />Platform
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 300 }}>
            Streamline your team. Manage leads, agents, and managers from a single unified dashboard.
          </p>
        </div>

      </div>

      {/* ── Right login form ── */}
      <div className="login-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.5s ease' }}>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#0f1923', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#9aa5b1' }}>Sign in to your CRM account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                <input type="email" className="form-input" placeholder="you@company.com"
                  value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); if(errors.email) setErrors(p => ({ ...p, email: '' })); }}
                  style={{ paddingLeft: 42, width: '100%', borderColor: errors.email ? '#ef4444' : undefined }} autoComplete="email" />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Enter your password"
                  value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); if(errors.password) setErrors(p => ({ ...p, password: '' })); }}
                  style={{ paddingLeft: 42, paddingRight: 42, width: '100%', borderColor: errors.password ? '#ef4444' : undefined }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.password}</p>}
            </div>
            {errors.form && <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{errors.form}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 14, color: '#9aa5b1' }}>
              New agent?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
            </p>
          </div>

          {/* Role guide */}
          <div style={{ marginTop: 32, padding: '16px 18px', background: '#f5f6fa', borderRadius: 10, border: '1px dashed #e8eaed' }}>
            <p style={{ fontSize: 11, color: '#9aa5b1', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roles in EstateFlow</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                { role: 'ADMIN',   color: '#b45309', bg: '#fdf3e0', desc: 'Full access — manages managers & agents' },
                { role: 'MANAGER', color: '#2563eb', bg: '#dbeafe', desc: 'Creates & assigns leads to agents'       },
                { role: 'AGENT',   color: '#16a34a', bg: '#dcfce7', desc: 'Views & comments on assigned leads'      },
              ].map(r => (
                <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: r.bg, color: r.color }}>{r.role}</span>
                  <span style={{ fontSize: 12, color: '#4a5568' }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
