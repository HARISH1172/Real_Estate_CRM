import { useState, useEffect } from 'react';
import { Plus, Search, Home, MapPin, IndianRupee, UserCheck, UserMinus, Edit2, Trash2, X, Filter, Building2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import propertyService from '../../services/propertyService';
import userService from '../../services/userService';
import siteVisitService from '../../services/siteVisitService';
import leadService from '../../services/leadService';
import { PROPERTY_TYPES, ROLES } from '../../utils/constants';
import { formatCurrency, getInitials, getErrorMessage } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  type: '',
  status: 'Available',
  address: { street: '', city: '', state: '', pincode: '' }
};

const PropertyManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const isAgent = user?.role === ROLES.AGENT;

  const [properties, setProperties] = useState([]);
  const [managers, setManagers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [showVisitModal, setShowVisitModal] = useState(null);
  const [leads, setLeads] = useState([]);
  const [visitForm, setVisitForm] = useState({ scheduledTime: '', notes: '', leadId: '' });

  const load = async () => {
    try {
      let propCall;
      if (isAdmin) propCall = propertyService.getAllProperties();
      else if (isManager) propCall = propertyService.getManagerProperties();
      else propCall = propertyService.getAgentProperties();

      const [propRes, managerRes, agentRes, leadRes] = await Promise.all([
        propCall,
        isAdmin ? userService.getManagers() : Promise.resolve({ data: [] }),
        isManager ? userService.getManagerAgents() : Promise.resolve({ data: [] }),
        isAgent ? leadService.getAllLeads() : Promise.resolve({ data: [] })
      ]);
      setProperties(propRes.data || []);
      setManagers(managerRes.data || []);
      setAgents(agentRes.data || []);
      if (isAgent) {
        setLeads(leadRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load properties or users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = properties.filter(p => {
    const matchSearch = `${p.name} ${p.address?.city} ${p.address?.street}`.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || p.type === filterType;
    return matchSearch && matchType;
  });

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const fA = (k, v) => setForm(prev => ({ ...prev, address: { ...prev.address, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.type) { toast.error('Fill required fields'); return; }
    setSubmitting(true);
    try {
      // Map frontend type to backend Enum (uppercase)
      const submitData = { ...form, type: form.type.toUpperCase().replace(' ', '_') };
      if (editItem) {
        const res = await propertyService.updateProperty(editItem.id, submitData);
        setProperties(prev => prev.map(p => p.id === editItem.id ? res.data : p));
        toast.success('Property updated!');
      } else {
        const res = await propertyService.createProperty(submitData);
        setProperties(prev => [res.data, ...prev]);
        toast.success('Property created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await propertyService.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success('Property deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) { toast.error('Select a user'); return; }
    try {
      if (isAdmin) {
        await propertyService.assignToManager(assignModal.id, selectedUser);
        const m = managers.find(x => x.email === selectedUser);
        setProperties(prev => prev.map(p => p.id === assignModal.id ? { ...p, assignedManagerName: m.name } : p));
      } else {
        await propertyService.assignToAgent(assignModal.id, selectedUser);
        const a = agents.find(x => x.email === selectedUser);
        setProperties(prev => prev.map(p => p.id === assignModal.id ? { ...p, assignedAgentName: a.name } : p));
      }
      toast.success('Assigned successfully!');
      setAssignModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUnassign = async (propertyId, type) => {
    if (!window.confirm(`Unassign this property from the current ${type}?`)) return;
    try {
      if (type === 'manager') {
        await propertyService.assignToManager(propertyId, '');
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, assignedManagerName: null } : p));
      } else {
        await propertyService.assignToAgent(propertyId, '');
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, assignedAgentName: null } : p));
      }
      toast.success('Unassigned successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!visitForm.leadId || !visitForm.scheduledTime) { toast.error('Select lead and time'); return; }
    setSubmitting(true);
    try {
      await siteVisitService.scheduleVisit({
        propertyId: showVisitModal.id,
        leadId: visitForm.leadId,
        visitTime: visitForm.scheduledTime,
        notes: visitForm.notes
      });
      toast.success('Site visit scheduled!');
      setShowVisitModal(null);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  };
  if (loading) return <LoadingSpinner />;

  return (
    <div className="property-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Property Assets</h1>
          <p className="page-subtitle">{properties.length} total properties in inventory</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); }} className="btn btn-primary">
            <Plus size={16} /> Add Property
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
            <Search size={15} color="#9aa5b1" />
            <input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input" style={{ width: 'auto', margin: 0 }}>
            <option value="ALL">All Types</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t.toUpperCase().replace(' ', '_')}>{t}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Home size={24} /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>No properties found</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Type</th>
                  {isAgent ? <th>Manager</th> : <th>Assigned To</th>}
                  {!isAgent && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td data-label="Property">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={20} color="#1a3c5e" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: '#9aa5b1' }}>{p.status}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Location">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#4a5568' }}>
                        <MapPin size={12} color="#9aa5b1" /> {p.address?.city || '—'}
                      </div>
                    </td>
                    <td data-label="Price" style={{ fontWeight: 600, color: '#0f1923' }}>{formatCurrency(p.price)}</td>
                    <td data-label="Type"><span className="badge badge-info">{p.type}</span></td>
                    <td data-label={isAgent ? "Manager" : "Assigned To"}>
                      {isAgent ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <div className="avatar avatar-primary" style={{ width: 22, height: 22, fontSize: 10 }}>{getInitials(p.assignedManagerName || 'M')}</div>
                           <span style={{ fontSize: 13 }}>{p.assignedManagerName || 'Not Assigned'}</span>
                           <button onClick={() => { setShowVisitModal(p); setVisitForm({ scheduledTime: '', notes: '', leadId: '' }); }} className="btn btn-ghost btn-sm" style={{ marginLeft: 8, color: '#166534' }}>
                             Schedule Visit
                           </button>
                         </div>
                      ) : isAdmin ? (
                        p.assignedManagerName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="avatar avatar-primary" style={{ width: 22, height: 22, fontSize: 10 }}>{getInitials(p.assignedManagerName)}</div>
                            <span style={{ fontSize: 13 }}>{p.assignedManagerName}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleUnassign(p.id, 'manager'); }} className="btn btn-ghost btn-sm" style={{ padding: 2, color: '#9aa5b1' }} title="Unassign">
                              <UserMinus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setAssignModal(p); setSelectedUser(''); }} className="btn btn-ghost btn-sm">Assign Manager</button>
                        )
                      ) : (
                        p.assignedAgentName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="avatar avatar-success" style={{ width: 22, height: 22, fontSize: 10 }}>{getInitials(p.assignedAgentName)}</div>
                            <span style={{ fontSize: 13 }}>{p.assignedAgentName}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleUnassign(p.id, 'agent'); }} className="btn btn-ghost btn-sm" style={{ padding: 2, color: '#9aa5b1' }} title="Unassign">
                              <UserMinus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setAssignModal(p); setSelectedUser(''); }} className="btn btn-ghost btn-sm">Assign Agent</button>
                        )
                      )}
                    </td>
                    {!isAgent && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditItem(p); setForm(p); setShowModal(true); }} className="btn btn-ghost btn-sm"><Edit2 size={13} /></button>
                          {isAdmin && <button onClick={() => handleDelete(p.id)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Property Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{editItem ? 'Edit Property' : 'Add Property'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Property Name *</label>
                  <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9aa5b1' }} />
                    <input type="number" className="form-input" style={{ paddingLeft: 30 }} value={form.price} onChange={e => f('price', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select className="form-input" value={form.type} onChange={e => f('type', e.target.value)} required>
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description} onChange={e => f('description', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Street Address</label>
                  <input className="form-input" value={form.address.street} onChange={e => fA('street', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.address.city} onChange={e => fA('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" value={form.address.pincode} onChange={e => fA('pincode', e.target.value)} maxLength={6} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Save Property'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Assign {isAdmin ? 'Manager' : 'Agent'}</h3>
              <button onClick={() => setAssignModal(null)} className="btn-close"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select {isAdmin ? 'Manager' : 'Agent'}</label>
                <select className="form-input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                  <option value="">Choose...</option>
                  {(isAdmin 
                    ? managers.filter(m => m.assignedCity?.toLowerCase() === assignModal.address?.city?.toLowerCase()) 
                    : agents
                  ).map(u => (
                    <option key={u.email} value={u.email}>{u.name} ({u.email}) - {isAdmin ? `Jurisdiction: ${u.assignedCity}` : u.address?.city}</option>
                  ))}
                </select>
                {isAdmin && managers.filter(m => m.assignedCity?.toLowerCase() === assignModal.address?.city?.toLowerCase()).length === 0 && (
                  <p style={{ color: '#ef4444', fontSize: 11, marginTop: 6, fontWeight: 500 }}>
                    No managers found with jurisdiction in {assignModal.address?.city}. Please assign a manager to this city first.
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setAssignModal(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleAssign} className="btn btn-primary"><UserCheck size={16} /> Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Modal */}
      {showVisitModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowVisitModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Schedule Site Visit</h3>
              <button onClick={() => setShowVisitModal(null)} className="btn-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleScheduleVisit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Property</label>
                  <input className="form-input" value={showVisitModal.name} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Select Lead *</label>
                  <select className="form-input" value={visitForm.leadId} onChange={e => setVisitForm({ ...visitForm, leadId: e.target.value })} required>
                    <option value="">Choose lead...</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={visitForm.scheduledTime} 
                    onChange={e => setVisitForm({ ...visitForm, scheduledTime: e.target.value })} 
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(0, 0, 0, 0);
                      return tomorrow.toISOString().slice(0, 16);
                    })()}
                    onKeyDown={(e) => e.preventDefault()}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={3} placeholder="Meeting notes..." value={visitForm.notes} onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowVisitModal(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Scheduling...' : 'Schedule Visit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
