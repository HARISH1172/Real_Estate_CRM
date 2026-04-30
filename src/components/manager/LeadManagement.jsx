import { useState, useEffect, Fragment } from 'react';
import { Plus, Search, Filter, X, UserCheck, UserMinus, Edit2, Trash2, Phone, Mail, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../../services/leadService';
import userService from '../../services/userService';
import propertyService from '../../services/propertyService';
import followUpService from '../../services/followUpService';
import siteVisitService from '../../services/siteVisitService';
import commentService from '../../services/commentService';
import { LEAD_STATUS, LEAD_STATUS_LABELS, LEAD_STATUS_BADGE, PROPERTY_TYPES, VISIT_STATUS_BADGE } from '../../utils/constants';
import { formatDate, formatDateTime, formatCurrency, getInitials, getErrorMessage } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';


const EMPTY_FORM = { name: '', phone: '', email: '', propertyType: '', status: 'NEW', notes: '' };

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, propertyId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [leadComments, setLeadComments] = useState({});
  const [leadFollowups, setLeadFollowups] = useState({});
  const [leadVisits, setLeadVisits] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Client name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit Indian phone';
    if (!form.propertyType && !form.propertyId) e.propertyType = 'Select property or type';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';

  const load = async () => {
    try {
      const [leadsRes, agentsRes, propsRes] = await Promise.all([
        leadService.getAllLeads(),
        isAdmin ? userService.getAgents() : (isManager ? userService.getManagerAgents() : userService.getAgents()),
        isAdmin ? propertyService.getAllProperties() : propertyService.getManagerProperties()
      ]);
      setLeads(leadsRes.data || []);
      setAgents(agentsRes.data || []);
      setProperties(propsRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = leads.filter(l => {
    const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
    const matchSearch = `${l.name} ${l.phone} ${l.email}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openCreate = () => { setEditLead(null); setForm({ ...EMPTY_FORM, propertyId: '' }); setErrors({}); setShowModal(true); };
  const openEdit = (lead) => { setEditLead(lead); setForm({ name: lead.name, phone: lead.phone, email: lead.email || '', propertyType: lead.propertyType, status: lead.status, notes: lead.notes || '', propertyId: lead.property?.id || '' }); setErrors({}); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editLead) {
        await leadService.updateLead(editLead.id, form);
        setLeads(prev => prev.map(l => l.id === editLead.id ? { ...l, ...form } : l));
        toast.success('Lead updated!');
      } else {
        const res = await leadService.createLead(form);
        setLeads(prev => [res.data, ...prev]);
        toast.success('Lead created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await leadService.deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead deleted');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleAssign = async () => {
    if (!selectedAgent) { toast.error('Select an agent'); return; }
    try {
      await leadService.assignLead(assignModal.id, selectedAgent);
      const agent = agents.find(a => a.email === selectedAgent);
      setLeads(prev => prev.map(l => l.id === assignModal.id ? { ...l, assignedAgentEmail: selectedAgent, agentName: agent?.name } : l));
      toast.success('Lead assigned!');
      setAssignModal(null);
      setSelectedAgent('');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleUnassign = async (leadId) => {
    if (!window.confirm('Unassign this lead from the current agent?')) return;
    try {
      await leadService.assignLead(leadId, '');
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedAgentEmail: null, agentName: null } : l));
      toast.success('Lead unassigned');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const toggleExpand = async (leadId) => {
    if (expandedLeadId === leadId) {
      setExpandedLeadId(null);
      return;
    }
    setExpandedLeadId(leadId);
    if (!leadComments[leadId]) {
      setLoadingComments(true);
      try {
        const [cRes, fRes, vRes] = await Promise.all([
          commentService.getCommentsByLead(leadId),
          followUpService.getFollowUpsByLead(leadId),
          siteVisitService.getVisitsByLead(leadId)
        ]);
        setLeadComments(prev => ({ ...prev, [leadId]: cRes.data || [] }));
        setLeadFollowups(prev => ({ ...prev, [leadId]: fRes.data || [] }));
        setLeadVisits(prev => ({ ...prev, [leadId]: vRes.data || [] }));
      } catch (err) {
        toast.error('Failed to load activity');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const f = (k, v) => setForm({ ...form, [k]: v });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">{leads.length} total leads</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 280 }}>
            <Search size={15} color="#9aa5b1" />
            <input placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ border: '1.5px solid #e8eaed', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: 'white', color: '#4a5568', cursor: 'pointer', outline: 'none' }}>
            <option value="ALL">All Status</option>
            {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: '#f5f6fa' }}><Filter size={24} color="#9aa5b1" /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>No leads found</p>
            <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Add Your First Lead</button>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Date</th>
                   <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const isExpanded = expandedLeadId === lead.id;
                  const activities = leadComments[lead.id] || [];
                  return (
                    <Fragment key={lead.id}>
                      <tr onClick={() => toggleExpand(lead.id)} style={{ cursor: 'pointer' }}>
                        <td data-label="Client">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-accent">{getInitials(lead.name)}</div>
                            <div>
                              <p style={{ fontWeight: 500, fontSize: 14 }}>{lead.name}</p>
                              <p style={{ fontSize: 12, color: '#9aa5b1' }}>{lead.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td data-label="Property">
                          <p style={{ fontSize: 13, color: '#4a5568' }}>{lead.propertyType}</p>
                        </td>
                        <td data-label="Status"><span className={`badge ${LEAD_STATUS_BADGE[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span></td>
                        <td data-label="Assigned">
                          {lead.agentName
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div className="avatar avatar-success" style={{ width: 24, height: 24, fontSize: 10 }}>{getInitials(lead.agentName)}</div>
                                <span style={{ fontSize: 13 }}>{lead.agentName}</span>
                                {isManager && (
                                  <button onClick={(e) => { e.stopPropagation(); handleUnassign(lead.id); }} className="btn btn-ghost btn-sm" style={{ padding: 2, color: '#9aa5b1' }} title="Unassign">
                                    <UserMinus size={13} />
                                  </button>
                                )}
                              </div>
                            : isManager ? (
                                <button onClick={(e) => { e.stopPropagation(); setAssignModal(lead); setSelectedAgent(''); }} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                                  <UserCheck size={12} /> Assign
                                </button>
                              ) : (
                                <span style={{ fontSize: 12, color: '#9aa5b1', fontStyle: 'italic' }}>Unassigned</span>
                              )
                          }
                        </td>
                        <td data-label="Date" style={{ fontSize: 13, color: '#9aa5b1' }}>{formatDate(lead.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={(e) => { e.stopPropagation(); openEdit(lead); }} className="btn btn-ghost btn-sm"><Edit2 size={13} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" style={{ padding: '0 20px 20px 60px', background: '#fafbfc' }}>
                            <div style={{ borderLeft: '2px solid #e8eaed', paddingLeft: 20, paddingTop: 10 }}>
                              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a3c5e', marginBottom: 15 }}>Lead Activity & History</h4>
                              
                              {loadingComments && !leadComments[lead.id] ? (
                                <p style={{ fontSize: 12, color: '#9aa5b1' }}>Loading activity…</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                  
                                  {/* Comments Section */}
                                  <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Recent Comments</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {(leadComments[lead.id] || []).length === 0 ? (
                                        <p style={{ fontSize: 13, color: '#9aa5b1', fontStyle: 'italic' }}>No comments recorded.</p>
                                      ) : (leadComments[lead.id] || []).map(c => (
                                        <div key={c.id} style={{ background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #f0f2f5' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3c5e' }}>{c.authorName}</span>
                                            <span style={{ fontSize: 11, color: '#9aa5b1' }}>{formatDate(c.createdAt)}</span>
                                          </div>
                                          <p style={{ fontSize: 13, color: '#4a5568' }}>{c.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Follow-ups Section */}
                                  <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Scheduled Follow-ups</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {(leadFollowups[lead.id] || []).length === 0 ? (
                                        <p style={{ fontSize: 13, color: '#9aa5b1', fontStyle: 'italic' }}>No follow-ups scheduled.</p>
                                      ) : (leadFollowups[lead.id] || []).map(f => (
                                        <div key={f.id} style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: 8, border: '1px solid #fef3c7' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#b45309' }}>Next Contact</span>
                                            <span style={{ fontSize: 11, color: '#b45309' }}>{formatDate(f.scheduledTime)}</span>
                                          </div>
                                          <p style={{ fontSize: 13, color: '#92400e' }}>{f.notes}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Site Visits Section */}
                                  <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Site Visits</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {(leadVisits[lead.id] || []).length === 0 ? (
                                        <p style={{ fontSize: 13, color: '#9aa5b1', fontStyle: 'italic' }}>No site visits recorded.</p>
                                      ) : (leadVisits[lead.id] || []).map(v => (
                                        <div key={v.id} style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 8, border: '1px solid #dcfce7' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>{formatDateTime(v.visitTime)}</span>
                                            <span className={`badge ${VISIT_STATUS_BADGE[v.status] || 'badge-ghost'}`} style={{ fontSize: 10 }}>{v.status}</span>
                                          </div>
                                          <p style={{ fontSize: 13, color: '#166534' }}>{v.notes}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              )}
                              {lead.notes && (
                                <div style={{ marginTop: 15, borderTop: '1px solid #f0f2f5', paddingTop: 10 }}>
                                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa5b1', textTransform: 'uppercase', marginBottom: 4 }}>Lead Notes</p>
                                  <p style={{ fontSize: 13, color: '#4a5568' }}>{lead.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Lead Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{editLead ? 'Edit Lead' : 'Add New Lead'}</h3>
                <p style={{ fontSize: 13, color: '#9aa5b1', marginTop: 2 }}>Fill in the lead details below</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body grid-2">
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Client Name *</label>
                  <input type="text" className="form-input" placeholder="Full name" value={form.name} onChange={e => { f('name', e.target.value); if(errors.name) setErrors(p => ({ ...p, name: '' })); }} style={{ width: '100%', borderColor: errors.name ? '#ef4444' : undefined }} required />
                  {errors.name && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.name}</p>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone *</label>
                  <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => { f('phone', e.target.value); if(errors.phone) setErrors(p => ({ ...p, phone: '' })); }} style={{ width: '100%', borderColor: errors.phone ? '#ef4444' : undefined }} required />
                  {errors.phone && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.phone}</p>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="client@email.com" value={form.email} onChange={e => f('email', e.target.value)} style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Interested Property</label>
                  <select className="form-input" value={form.propertyId} onChange={e => f('propertyId', e.target.value)} style={{ width: '100%' }}>
                    <option value="">Select specific property (optional)</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name} - {p.address?.city}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Property Type *</label>
                  <select className="form-input" value={form.propertyType} onChange={e => { f('propertyType', e.target.value); if(errors.propertyType) setErrors(p => ({ ...p, propertyType: '' })); }} style={{ width: '100%', borderColor: errors.propertyType ? '#ef4444' : undefined }} required>
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.propertyType && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{errors.propertyType}</p>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => f('status', e.target.value)} style={{ width: '100%' }}>
                    {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" placeholder="Any additional notes…" value={form.notes} onChange={e => f('notes', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving…' : editLead ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>Assign Lead</h3>
                <p style={{ fontSize: 13, color: '#9aa5b1' }}>Assign "{assignModal.name}" to an agent</p>
              </div>
              <button onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Agent</label>
                <select className="form-input" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Choose agent</option>
                  {agents.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setAssignModal(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleAssign} className="btn btn-primary"><UserCheck size={14} /> Assign Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
