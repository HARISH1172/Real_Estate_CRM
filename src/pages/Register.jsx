import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/helpers';

/* Agent self-registration: role is fixed to AGENT on submit */
const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=form, 1=success(pending approval)
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name' && !value.trim()) error = 'Full Name is required';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
    if (name === 'phone' && !/^[6-9]\d{9}$/.test(value)) error = 'Enter a valid 10-digit phone number';
    if (name === 'password' && value.length < 6) error = 'Password must be at least 6 characters';
    if (name === 'confirmPassword' && value !== form.password) error = 'Passwords do not match';
    if (name === 'otp' && value.length < 6) error = 'Enter 6-digit OTP';
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAddress = () => {
    const addrErrors = {};
    if (!form.address.street.trim()) addrErrors.street = 'Street is required';
    if (!form.address.city.trim()) addrErrors.city = 'City is required';
    if (!form.address.state.trim()) addrErrors.state = 'State is required';
    if (!form.address.pincode.trim()) addrErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.address.pincode)) addrErrors.pincode = 'Enter valid 6-digit pincode';
    
    setErrors(prev => ({ ...prev, ...addrErrors }));
    return Object.keys(addrErrors).length === 0;
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const fAddr = (key, val) => setForm(prev => ({ ...prev, address: { ...prev.address, [key]: val } }));

  const handleSendOtp = async () => {
    if (!validateField('email', form.email)) return;
    setSendingOtp(true);
    try {
      await authService.sendOtp(form.email.trim());
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      setErrors(p => ({ ...p, email: getErrorMessage(err) }));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateField('name', form.name);
    const isEmailValid = validateField('email', form.email);
    const isPhoneValid = validateField('phone', form.phone);
    const isOtpValid = validateField('otp', form.otp);
    const isPassValid = validateField('password', form.password);
    const isConfirmValid = validateField('confirmPassword', form.confirmPassword);
    const isAddrValid = validateAddress();

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isOtpValid || !isPassValid || !isConfirmValid || !isAddrValid) {
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        otp: form.otp.trim(),
        password: form.password,
        phone: form.phone,
        role: 'AGENT',
        address: form.address,
      });
      toast.success('Registration successful! Await admin approval.');
      setStep(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6fa', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520, animation: 'fadeIn 0.4s ease' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1a3c5e,#2d5f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="white" />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#0f1923' }}>EstateFlow CRM</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {step === 0 ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#0f1923', marginBottom: 4 }}>Agent Registration</h2>
                <p style={{ fontSize: 13, color: '#9aa5b1' }}>Register as an agent. Your account will need admin approval before you can log in.</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* — Personal Info — */}
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Personal Information</p>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                    <input type="text" className="form-input" placeholder="e.g. Rahul Sharma"
                      value={form.name} onChange={e => { f('name', e.target.value); if(errors.name) validateField('name', e.target.value); }}
                      style={{ paddingLeft: 38, width: '100%', borderColor: errors.name ? '#ef4444' : undefined }} required />
                  </div>
                  {errors.name && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.name}</p>}
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type="email" className="form-input" placeholder="you@email.com"
                        value={form.email} onChange={e => { f('email', e.target.value); if(errors.email) validateField('email', e.target.value); }}
                        style={{ paddingLeft: 38, width: '100%', borderColor: errors.email ? '#ef4444' : undefined }} required />
                    </div>
                    {errors.email && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.email}</p>}
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone * <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(10-digit)</span></label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type="tel" className="form-input" placeholder="9876543210"
                        value={form.phone} onChange={e => { f('phone', e.target.value); if(errors.phone) validateField('phone', e.target.value); }}
                        maxLength={10} style={{ paddingLeft: 38, width: '100%', borderColor: errors.phone ? '#ef4444' : undefined }} required />
                    </div>
                    {errors.phone && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.phone}</p>}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">OTP Verification *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <CheckCircle size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type="text" className="form-input" placeholder="Enter OTP"
                        value={form.otp} onChange={e => { f('otp', e.target.value); if(errors.otp) validateField('otp', e.target.value); }}
                        style={{ paddingLeft: 38, width: '100%', borderColor: errors.otp ? '#ef4444' : undefined }} maxLength={6} required />
                    </div>
                    <button type="button" onClick={handleSendOtp} disabled={sendingOtp}
                      className="btn btn-ghost" style={{ fontSize: 12, height: 42, padding: '0 16px' }}>
                      {sendingOtp ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {errors.otp && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.otp}</p>}
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Password *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters"
                        value={form.password} onChange={e => { f('password', e.target.value); if(errors.password) validateField('password', e.target.value); }}
                        style={{ paddingLeft: 38, paddingRight: 36, width: '100%', borderColor: errors.password ? '#ef4444' : undefined }} required />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1', display: 'flex' }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.password && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.password}</p>}
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type="password" className="form-input" placeholder="Re-enter password"
                        value={form.confirmPassword} onChange={e => { f('confirmPassword', e.target.value); if(errors.confirmPassword) validateField('confirmPassword', e.target.value); }}
                        style={{ paddingLeft: 38, width: '100%', borderColor: errors.confirmPassword ? '#ef4444' : undefined }} required />
                    </div>
                    {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* — Address — */}
                <hr className="divider" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <MapPin size={14} color="#9aa5b1" />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Address</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Street *</label>
                  <input type="text" className="form-input" placeholder="House / Flat / Street name"
                    value={form.address.street} onChange={e => { fAddr('street', e.target.value); if(errors.street) setErrors(p => ({ ...p, street: '' })); }}
                    style={{ width: '100%', borderColor: errors.street ? '#ef4444' : undefined }} required />
                  {errors.street && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.street}</p>}
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">City *</label>
                    <input type="text" className="form-input" placeholder="e.g. Pune"
                      value={form.address.city} onChange={e => { fAddr('city', e.target.value); if(errors.city) setErrors(p => ({ ...p, city: '' })); }}
                      style={{ width: '100%', borderColor: errors.city ? '#ef4444' : undefined }} required />
                    {errors.city && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.city}</p>}
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">State *</label>
                    <input type="text" className="form-input" placeholder="e.g. Maharashtra"
                      value={form.address.state} onChange={e => { fAddr('state', e.target.value); if(errors.state) setErrors(p => ({ ...p, state: '' })); }}
                      style={{ width: '100%', borderColor: errors.state ? '#ef4444' : undefined }} required />
                    {errors.state && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.state}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input type="text" className="form-input" placeholder="e.g. 411001"
                    value={form.address.pincode} onChange={e => { fAddr('pincode', e.target.value); if(errors.pincode) setErrors(p => ({ ...p, pincode: '' })); }}
                    maxLength={6} style={{ width: '100%', borderColor: errors.pincode ? '#ef4444' : undefined }} required />
                  {errors.pincode && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.pincode}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 8 }}>
                  {loading ? 'Registering…' : <><span>Create Agent Account</span><ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            /* Step 1 — Success */
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#0f1923', marginBottom: 10 }}>Registration Submitted!</h2>
              <p style={{ fontSize: 14, color: '#9aa5b1', lineHeight: 1.8, marginBottom: 28 }}>
                Your agent account for <strong style={{ color: '#4a5568' }}>{form.email}</strong> has been created.<br />
                Please wait for the admin to approve your account. You'll be notified once approved.
              </p>
              <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Back to Login
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9aa5b1' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
