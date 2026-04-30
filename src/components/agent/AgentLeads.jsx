import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, IndianRupee, MapPin, Phone, Mail, X, Clock, CheckCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../../services/leadService';
import followUpService from '../../services/followUpService';
import siteVisitService from '../../services/siteVisitService';
import commentService from '../../services/commentService';
import { LEAD_STATUS_BADGE, LEAD_STATUS_LABELS, LEAD_STATUS, VISIT_STATUS, FOLLOW_UP_STATUS } from '../../utils/constants';
import { formatDate, formatDateTime, formatCurrency, getInitials, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Bell, MapPin as Pin } from 'lucide-react';

const AgentLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null); // lead id
  const [comments, setComments] = useState({});   // leadId → [comments]
  const [followups, setFollowups] = useState({}); // leadId → [followups]
  const [visits, setVisits]     = useState({});     // leadId → [visits]
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(null);
  const [form, setForm] = useState({ scheduledTime: '', notes: '' });
  const commentRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await leadService.getAllLeads();
        setLeads(res.data || []);
      } catch (err) {
        toast.error('Failed to load leads');
      } finally { setLoading(false); }
    };
    load();
  }, [user?.email]);

  const toggleExpand = async (leadId) => {
    if (expanded === leadId) { setExpanded(null); return; }
    setExpanded(leadId);
    setCommentText('');
    if (!comments[leadId]) {
      try {
        const [cRes, fRes, vRes] = await Promise.all([
          commentService.getCommentsByLead(leadId),
          followUpService.getFollowUpsByLead(leadId),
          siteVisitService.getVisitsByLead(leadId)
        ]);
        setComments(p => ({ ...p, [leadId]: cRes.data || [] }));
        setFollowups(p => ({ ...p, [leadId]: fRes.data || [] }));
        setVisits(p => ({ ...p, [leadId]: vRes.data || [] }));
      } catch (err) {
        toast.error('Failed to load activity');
      }
    }
    setTimeout(() => commentRef.current?.focus(), 100);
  };

  const handleAddComment = async (leadId) => {
    if (!commentText.trim()) { toast.error('Enter a comment'); return; }
    setSubmitting(true);
    try {
      const res = await commentService.addComment(leadId, commentText.trim());
      setComments(p => ({ ...p, [leadId]: [res.data, ...(p[leadId] || [])] }));
      setCommentText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadService.updateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Status updated to ${LEAD_STATUS_LABELS[newStatus]}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };



  const handleVisitStatusChange = async (visitId, leadId, newStatus) => {
    try {
      await siteVisitService.updateStatus(visitId, newStatus);
      setVisits(prev => ({
        ...prev,
        [leadId]: (prev[leadId] || []).map(v => v.id === visitId ? { ...v, status: newStatus } : v)
      }));
      toast.success(`Visit status updated to ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleFollowUpStatusChange = async (followUpId, leadId, newStatus) => {
    try {
      await followUpService.updateStatus(followUpId, newStatus);
      setFollowups(prev => ({
        ...prev,
        [leadId]: (prev[leadId] || []).map(f => f.id === followUpId ? { ...f, status: newStatus } : f)
      }));
      toast.success(`Follow-up marked as ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!form.scheduledTime) { toast.error('Select date and time'); return; }
    setSubmitting(true);
    try {
      const res = await followUpService.scheduleFollowUp({
        leadId: showFollowModal.id,
        scheduledTime: form.scheduledTime,
        notes: form.notes
      });
      // Follow-ups are now handled separately, so we don't necessarily add to comments
      setShowFollowModal(null);
      toast.success('Follow-up scheduled!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leads</h1>
          <p className="page-subtitle">{leads.length} leads assigned to you</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: 13 }}>
            {leads.filter(l => l.status !== 'BOOKING').length} Open
          </span>
          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 13 }}>
            {leads.filter(l => l.status === 'BOOKING').length} Won
          </span>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><MessageSquare size={24} /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>No leads assigned yet</p>
            <p style={{ fontSize: 13, color: '#9aa5b1' }}>Your manager will assign leads to you. Check back soon!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {leads.map(lead => {
            const isOpen    = expanded === lead.id;
            const leadComments = comments[lead.id] || [];
            return (
              <div key={lead.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Lead Header */}
                <div
                  onClick={() => toggleExpand(lead.id)}
                  style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 16 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div className="avatar avatar-accent" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}>
                      {getInitials(lead.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#0f1923' }}>{lead.name}</h3>
                        <span className={`badge ${LEAD_STATUS_BADGE[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color="#9aa5b1" /> {lead.phone}</span>
                        <span style={{ fontSize: 13, color: '#4a5568' }}>📐 {lead.propertyType}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: '#9aa5b1' }}>Assigned</p>
                      <p style={{ fontSize: 13, color: '#4a5568', fontWeight: 500 }}>{formatDate(lead.createdAt)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f5f6fa', borderRadius: 8, padding: '4px 10px' }}>
                      <MessageSquare size={13} color="#9aa5b1" />
                      <span style={{ fontSize: 12, color: '#9aa5b1' }}>{leadComments.length}</span>
                    </div>
                    {isOpen ? <ChevronUp size={18} color="#9aa5b1" /> : <ChevronDown size={18} color="#9aa5b1" />}
                  </div>
                </div>

                {/* Expanded Panel */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f0f2f5', animation: 'fadeIn 0.2s ease' }}>
                    {/* Lead Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, padding: '16px 24px', background: '#fafbfc', borderBottom: '1px solid #f0f2f5' }}>
                      {[
                        { label: 'Email',       value: lead.email || '—' },
                        { label: 'Property',    value: lead.propertyType },
                        { label: 'Assigned On', value: formatDate(lead.createdAt) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p style={{ fontSize: 11, color: '#9aa5b1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
                          <p style={{ fontSize: 13, color: '#0f1923', fontWeight: 500 }}>{value}</p>
                        </div>
                      ))}
                      <div>
                        <p style={{ fontSize: 11, color: '#9aa5b1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Update Status</p>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="form-control"
                          style={{ fontSize: 13, padding: '4px 8px', height: 'auto', width: '100%', maxWidth: '160px' }}>
                          {Object.entries(LEAD_STATUS).map(([key, value]) => (
                            <option key={key} value={value}>{LEAD_STATUS_LABELS[key]}</option>
                          ))}
                        </select>
                      </div>
                      {lead.notes && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <p style={{ fontSize: 11, color: '#9aa5b1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Notes</p>
                          <p style={{ fontSize: 13, color: '#4a5568' }}>{lead.notes}</p>
                        </div>
                      )}
                      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 10 }}>
                        <button onClick={() => { setShowFollowModal(lead); setForm({ scheduledTime: '', notes: '' }); }} className="btn btn-ghost" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
                          <Bell size={14} /> Set Follow-up
                        </button>
                      </div>
                    </div>

                    {/* Site Visits Section */}
                    {visits[lead.id]?.length > 0 && (
                      <div style={{ padding: '0 24px 20px' }}>
                         <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={15} color="#166534" /> Site Visits ({visits[lead.id].length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {visits[lead.id].map(v => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #dcfce7', gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{formatDateTime(v.visitTime)}</p>
                                <p style={{ fontSize: 12, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Building2 size={12} color="#166534" /> 
                                  <strong>{v.propertyName || 'Site Visit'}</strong>
                                </p>
                                {v.notes && <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{v.notes}</p>}
                              </div>
                              <select 
                                value={v.status} 
                                onChange={(e) => handleVisitStatusChange(v.id, lead.id, e.target.value)}
                                className="form-control"
                                style={{ fontSize: 11, padding: '2px 6px', height: 'auto', width: 'auto', background: '#fff' }}>
                                {Object.entries(VISIT_STATUS).map(([key, val]) => (
                                  <option key={key} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                      {/* Comments and Follow-ups Section */}
                      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Comments */}
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessageSquare size={15} color="#1a3c5e" /> Comments ({leadComments.length})
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {leadComments.length === 0 ? (
                              <p style={{ fontSize: 13, color: '#9aa5b1', fontStyle: 'italic' }}>No comments yet.</p>
                            ) : leadComments.map(c => (
                              <div key={c.id} style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 14px', borderLeft: '3px solid #1a3c5e' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a3c5e' }}>{c.authorName || 'Agent'}</span>
                                  <span style={{ fontSize: 11, color: '#9aa5b1' }}>{formatDateTime(c.createdAt)}</span>
                                </div>
                                <p style={{ fontSize: 13, color: '#4a5568' }}>{c.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Follow-ups */}
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bell size={15} color="#b45309" /> Scheduled Follow-ups ({(followups[lead.id] || []).length})
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(followups[lead.id] || []).length === 0 ? (
                              <p style={{ fontSize: 13, color: '#9aa5b1', fontStyle: 'italic' }}>No follow-ups scheduled.</p>
                            ) : (followups[lead.id] || []).map(f => (
                              <div key={f.id} style={{ background: '#fffbeb', borderRadius: 10, padding: '12px 14px', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>Next Contact</span>
                                    <span style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>{formatDateTime(f.scheduledTime)}</span>
                                  </div>
                                  <p style={{ fontSize: 13, color: '#92400e' }}>{f.notes}</p>
                                </div>
                                <select 
                                  value={f.status} 
                                  onChange={(e) => handleFollowUpStatusChange(f.id, lead.id, e.target.value)}
                                  className="form-control"
                                  style={{ fontSize: 11, padding: '2px 6px', height: 'auto', width: 'auto', background: '#fff' }}>
                                  {Object.entries(FOLLOW_UP_STATUS).map(([key, val]) => (
                                    <option key={key} value={val}>{val}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Add Comment */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <textarea
                          ref={commentRef}
                          placeholder="Add a comment or update about this lead…"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddComment(lead.id); }}
                          rows={2}
                          style={{ flex: 1, border: '1.5px solid #e8eaed', borderRadius: 10, padding: '10px 14px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                          onBlur={e => e.target.style.borderColor = '#e8eaed'}
                        />
                        <button
                          onClick={() => handleAddComment(lead.id)}
                          disabled={submitting || !commentText.trim()}
                          className="btn btn-primary"
                          style={{ alignSelf: 'flex-end', flexShrink: 0 }}>
                          <Send size={14} /> {submitting ? '…' : 'Post'}
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: '#9aa5b1', marginTop: 6 }}>Tip: Ctrl+Enter to post quickly</p>
                    </div>
                  )}
                </div>
            );
          })}
        </div>
      )}



      {/* Schedule Follow-up Modal */}
      {showFollowModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowFollowModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Set Follow-up</h3>
              <button onClick={() => setShowFollowModal(null)} className="btn-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleScheduleFollowUp}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Follow-up Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={form.scheduledTime} 
                    onChange={e => setForm({ ...form, scheduledTime: e.target.value })} 
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
                  <textarea className="form-input" rows={3} placeholder="What to discuss, reminders..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowFollowModal(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Setting...' : 'Set Follow-up'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLeads;
