import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, UserCog, X, Eye, EyeOff, Mail, User, Lock, Phone, MapPin, Edit2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import { formatDate, getInitials, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const EMPTY = { name: '', email: '', phone: '', password: '', assignedCity: '', address: { street: '', city: '', state: '', pincode: '' } };

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    try {
      const managersRes = await userService.getManagers();
      setManagers(managersRes.data || []); 
    } catch (err) {
      toast.error('Failed to load managers');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = managers.filter(m =>
    `${m.name} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const f = (k, v)    => setForm(p => ({ ...p, [k]: v }));
  const fA = (k, v)   => {
    setForm(p => ({ ...p, address: { ...p.address, [k]: v } }));
  };
  
  const openEdit = (m) => {
    setEditItem(m);
    setForm({
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      password: '', // Don't show password
      assignedCity: m.assignedCity || '',
      address: m.address || { street: '', city: '', state: '', pincode: '' }
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editItem && !form.password)) { toast.error('Fill required fields'); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { toast.error('Enter valid 10-digit phone'); return; }
    if (!form.assignedCity) { toast.error('Assigned city is required'); return; }
    if (!form.address.street || !form.address.city || !form.address.state || !form.address.pincode) {
      toast.error('Fill all address fields'); return;
    }
    setSubmitting(true);
    try {
      if (editItem) {
        await userService.updateUser(editItem.email, { ...form, role: 'MANAGER' });
        setManagers(p => p.map(m => m.email === editItem.email ? { ...m, ...form } : m));
        toast.success('Manager updated!');
      } else {
        // RegisterRequestDTO: { name, email, password, phone, role:'MANAGER', address }
        await userService.createManager({ ...form, role: 'MANAGER' });
        setManagers(p => [{ ...form, id: Date.now(), createdAt: new Date().toISOString() }, ...p]);
        toast.success('Manager created!');
      }
      setShowModal(false);
      setForm(EMPTY);
      setEditItem(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (email, id) => {
    if (!window.confirm('Delete this manager? This cannot be undone.')) return;
    try {
      await userService.deleteUser(email);
      setManagers(p => p.filter(m => m.id !== id));
      toast.success('Manager deleted');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Managers</h1>
          <p className="page-subtitle">{managers.length} manager{managers.length !== 1 ? 's' : ''} in your organisation</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(EMPTY); setShowModal(true); }} className="btn btn-primary">
          <Plus size={16} /> Create Manager
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
          <div className="search-bar">
            <Search size={15} color="#9aa5b1" />
            <input placeholder="Search managers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><UserCog size={24} /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>No managers found</p>
            <p style={{ fontSize: 13, color: '#9aa5b1' }}>Create your first manager to get started</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr>
                <th>Manager</th><th>Email</th><th>Phone</th><th>Agents</th><th>Created</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(m => (
                   <tr key={m.id}>
                    <td data-label="Manager">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-primary">{getInitials(m.name)}</div>
                        <span style={{ fontWeight: 500 }}>{m.name}</span>
                      </div>
                    </td>
                    <td data-label="Email" style={{ color: '#4a5568' }}>{m.email}</td>
                    <td data-label="Jurisdiction"><span className="badge" style={{ background: 'var(--primary-lighter)', color: 'var(--primary)' }}>{m.assignedCity || '—'}</span></td>
                    <td data-label="Phone" style={{ color: '#4a5568' }}>{m.phone || '—'}</td>
                    <td data-label="Agents"><span className="badge badge-info">{m.agentCount ?? 0} agents</span></td>
                    <td data-label="Created" style={{ color: '#9aa5b1', fontSize: 13 }}>{formatDate(m.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(m)} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(m.email, m.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{editItem ? 'Edit Manager' : 'Create Manager'}</h3>
                <p style={{ fontSize: 13, color: '#9aa5b1', marginTop: 2 }}>{editItem ? `Updating details for ${editItem.name}` : 'Fill in details — an account will be created with role MANAGER'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Personal */}
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Personal Info</p>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                    <input type="text" className="form-input" placeholder="e.g. Amit Kumar"
                      value={form.name} onChange={e => f('name', e.target.value)}
                      style={{ paddingLeft: 34, width: '100%' }} required />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type="email" className="form-input" placeholder="manager@company.com"
                        value={form.email} onChange={e => f('email', e.target.value)}
                        style={{ paddingLeft: 34, width: '100%' }} disabled={!!editItem} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone * <span style={{ fontWeight: 400, textTransform: 'none' }}>(10-digit)</span></label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                      <input type="tel" className="form-input" placeholder="9876543210"
                        value={form.phone} onChange={e => f('phone', e.target.value)}
                        maxLength={10} style={{ paddingLeft: 34, width: '100%' }} required />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{editItem ? 'Update Password' : 'Password *'} {editItem && <span style={{ fontWeight: 400, textTransform: 'none' }}>(leave blank to keep current)</span>}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                    <input type={showPass ? 'text' : 'password'} className="form-input" placeholder={editItem ? "Enter new password" : "Min. 6 characters"}
                      value={form.password} onChange={e => f('password', e.target.value)}
                      style={{ paddingLeft: 34, paddingRight: 36, width: '100%' }} required={!editItem} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1', display: 'flex' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Jurisdiction */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, marginTop: 20 }}>
                  <TrendingUp size={13} color="var(--primary)" />
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Work Jurisdiction</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned City * <span style={{ fontWeight: 400, textTransform: 'none', color: '#9aa5b1' }}>(Property assignment will be restricted to this city)</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Pune"
                    value={form.assignedCity} onChange={e => f('assignedCity', e.target.value)} style={{ width: '100%' }} required />
                </div>

                {/* Address */}
                <hr className="divider" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <MapPin size={13} color="#9aa5b1" />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Address</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Street *</label>
                  <input type="text" className="form-input" placeholder="House / Flat / Street"
                    value={form.address.street} onChange={e => fA('street', e.target.value)} style={{ width: '100%' }} required />
                </div>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">City *</label>
                    <input type="text" className="form-input" placeholder="e.g. Pune"
                      value={form.address.city} onChange={e => fA('city', e.target.value)} style={{ width: '100%' }} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">State *</label>
                    <input type="text" className="form-input" placeholder="e.g. Maharashtra"
                      value={form.address.state} onChange={e => fA('state', e.target.value)} style={{ width: '100%' }} required />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Pincode *</label>
                  <input type="text" className="form-input" placeholder="e.g. 411001"
                    value={form.address.pincode} onChange={e => fA('pincode', e.target.value)}
                    maxLength={6} style={{ width: '100%' }} required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving…' : editItem ? 'Update Manager' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageManagers;
