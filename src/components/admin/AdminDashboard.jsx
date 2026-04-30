import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Users, UserCheck, Briefcase, TrendingUp, Clock, CheckCircle, XCircle, Eye, Shield, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../common/StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import userService from '../../services/userService';
import { formatDate, getInitials, getErrorMessage } from '../../utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats]           = useState(null);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'
  const [drillDownData, setDrillDownData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userService.getDashboardStats();
        setStats(res.data);
        // Backend doesn't provide pending agents directly in stats.
        // For now, I'll assume stats might contain them or keep mock.
        setPendingAgents(res.data?.pendingAgents || []);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally { setLoading(false); }
    };
    load();
  }, []);

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

  const handleApprove = (id) => {
    // Approval requires a manager, so redirect to ManageAgents
    toast('Select a manager to approve agent', { icon: 'ℹ️' });
    navigate('/admin/agents');
  };

  const handleReject = async (email, id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userService.deleteUser(email);
      toast.success('Agent rejected');
      setPendingAgents(p => p.filter(a => a.id !== id));
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} — full system overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard title="Total Managers" value={stats?.totalManagers} icon={Briefcase}   color="primary" />
        <StatsCard title="Total Agents"   value={stats?.totalAgents}   icon={Users}       color="info"    />
        <StatsCard title="Total Leads"    value={stats?.totalLeads}    icon={TrendingUp}  color="accent"  />
        <StatsCard title="Active Leads"   value={stats?.activeLeads}   icon={CheckCircle} color="success" />
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

        {/* Leads by Region */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Leads by Region</h3>
          {Object.keys(stats?.cityBreakdown || {}).length === 0 ? (
             <div className="empty-state" style={{ height: 240 }}>
                <MapPin size={24} color="#9aa5b1" />
                <p style={{ fontSize: 13, color: '#9aa5b1', marginTop: 8 }}>No region data available</p>
                <p style={{ fontSize: 11, color: '#cbd5e0' }}>Ensure managers have an Assigned City in their profile</p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={Object.entries(stats?.cityBreakdown || {}).map(([name, value]) => ({ name, value }))}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(stats?.cityBreakdown || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#1a3c5e', '#2d5f8a', '#e8a838', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          )}
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

      {/* Quick Actions */}
      <div className="stats-grid" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Manage Managers', desc: 'Create & manage managers', to: '/admin/managers', color: 'var(--primary)', bg: 'var(--primary-lighter)', icon: Briefcase },
          { label: 'Manage Agents',   desc: 'Approve agents & assign',  to: '/admin/agents',   color: '#2563eb',        bg: '#dbeafe',               icon: Users },
          { label: 'All Agents',      desc: `${pendingAgents.length} pending approvals`, to: '/admin/agents', color: '#d97706', bg: '#fef3c7', icon: Clock },
        ].map(({ label, desc, to, color, bg, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }}
            onClick={() => navigate(to)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f1923', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 12, color: '#9aa5b1' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fdf3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#b45309" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Pending Agent Approvals</h3>
              <p style={{ fontSize: 12, color: '#9aa5b1' }}>{pendingAgents.length} agent{pendingAgents.length !== 1 ? 's' : ''} awaiting approval</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/agents')} className="btn btn-ghost btn-sm">
            <Eye size={14} /> View All
          </button>
        </div>

        {pendingAgents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircle size={22} /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>All caught up!</p>
            <p style={{ fontSize: 13, color: '#9aa5b1' }}>No pending agent approvals</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Agent Name</th><th>Email</th><th>Phone</th><th>City</th><th>Applied On</th><th>Actions</th></tr></thead>
              <tbody>
                {pendingAgents.map(agent => (
                  <tr key={agent.id}>
                    <td data-label="Agent">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-accent">{getInitials(agent.name)}</div>
                        <span style={{ fontWeight: 500 }}>{agent.name}</span>
                      </div>
                    </td>
                    <td data-label="Email" style={{ color: '#4a5568' }}>{agent.email}</td>
                    <td data-label="Phone" style={{ color: '#4a5568' }}>{agent.phone || '—'}</td>
                    <td data-label="City" style={{ color: '#4a5568', fontSize: 13 }}>{agent.address?.city || '—'}</td>
                    <td data-label="Applied" style={{ color: '#9aa5b1', fontSize: 13 }}>{formatDate(agent.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleApprove(agent.id)} className="btn btn-success btn-sm">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => handleReject(agent.email, agent.id)} className="btn btn-danger btn-sm">
                          <XCircle size={13} /> Reject
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
    </div>
  );
};

export default AdminDashboard;
