import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { ClipboardList, CheckCircle, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../common/StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import userService from '../../services/userService';
import leadService from '../../services/leadService';
import { LEAD_STATUS_BADGE, LEAD_STATUS_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'
  const [drillDownData, setDrillDownData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
          const [sRes, lRes] = await Promise.all([
            userService.getDashboardStats(),
            leadService.getMyLeads(),
          ]);
        setStats(sRes.data);
        setLeads((lRes.data || []).slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally { setLoading(false); }
    };
    if (user?.email) load();
  }, [user?.email]);

  const handleDrillDown = async (data) => {
    if (!data || !data.month) return;
    try {
      const res = await userService.getDailyTrend(data.month);
      setDrillDownData(res.data);
      setSelectedMonth(data.month);
      setViewMode('daily');
    } catch (err) {
      toast.error('Failed to load daily trend');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's a summary of your assigned leads</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard title="My Leads"      value={stats?.totalLeads}       icon={ClipboardList}  color="primary" />
        <StatsCard title="Open Leads"    value={stats?.assignedLeads}    icon={Clock}          color="warning" />
        <StatsCard title="Closed Leads"  value={stats?.totalConversions} icon={CheckCircle}    color="success" />
        <StatsCard title="Comments Made" value={stats?.totalFollowUps}   icon={MessageSquare}  color="info"    />
      </div>

      {/* Tips Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#1a3c5e,#2d5f8a)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Quick Tip</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Add comments to stay organised</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Document every interaction with your leads to track progress and close faster.</p>
        </div>
        <button onClick={() => navigate('/agent/leads')} className="btn btn-accent btn-sm" style={{ flexShrink: 0 }}>
          View Leads <ArrowRight size={14} />
        </button>
      </div>

      {/* Graphical Analytics */}
      <div className="dashboard-grid">
        {/* Leads by Status */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={Object.entries(stats?.statusBreakdown || {}).map(([name, value]) => ({ name, value }))}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {Object.keys(stats?.statusBreakdown || {}).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#1a3c5e', '#e8a838', '#3b82f6', '#22c55e', '#ef4444'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Property Type */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Leads by Property Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={Object.entries(stats?.propertyTypeBreakdown || {}).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8f9fa' }} />
              <Bar dataKey="value" fill="#1a3c5e" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly/Daily Activity Trend */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
              {viewMode === 'monthly' ? 'Monthly Lead Trend' : `Daily Activity for ${selectedMonth}`}
            </h3>
            {viewMode === 'daily' && (
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setViewMode('monthly')}>
                ← Back to Monthly
              </button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {viewMode === 'monthly' ? (
              <LineChart 
                data={stats?.monthlyTrend || []} 
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    handleDrillDown(data.activePayload[0].payload);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#1a3c5e" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#1a3c5e', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, stroke: '#1a3c5e', strokeWidth: 2, fill: '#fff' }} 
                />
              </LineChart>
            ) : (
              <LineChart data={drillDownData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#e8a838" strokeWidth={3} dot={{ r: 4, fill: '#e8a838', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>My Recent Leads</h3>
          <button onClick={() => navigate('/agent/leads')} className="btn btn-ghost btn-sm">
            View All <ArrowRight size={13} />
          </button>
        </div>
        {leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ClipboardList size={22} /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>No leads assigned yet</p>
            <p style={{ fontSize: 13, color: '#9aa5b1' }}>Your manager will assign leads to you soon</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Client</th><th>Property</th><th>Status</th><th>Assigned On</th></tr></thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/agent/leads')}>
                    <td data-label="Client" style={{ fontWeight: 500 }}>{lead.name}</td>
                    <td data-label="Property" style={{ color: '#4a5568', fontSize: 13 }}>{lead.propertyType}</td>
                    <td data-label="Status">
                       <span className={`badge ${LEAD_STATUS_BADGE[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span>
                    </td>
                    <td data-label="Assigned" style={{ fontSize: 13, color: '#9aa5b1' }}>{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
