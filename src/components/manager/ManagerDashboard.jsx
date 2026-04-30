import { useState, useEffect } from 'react';
import { ClipboardList, Users, TrendingUp, CheckCircle, Plus, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import StatsCard from '../common/StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import userService from '../../services/userService';
import leadService from '../../services/leadService';
import { LEAD_STATUS_LABELS, LEAD_STATUS_BADGE } from '../../utils/constants';
import { formatDate, getInitials, truncate } from '../../utils/helpers';

const CHART_DATA = [];

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'
  const [drillDownData, setDrillDownData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          userService.getDashboardStats(),
          leadService.getAllLeads(),
        ]);
        setStats(statsRes.data);
        setRecentLeads((leadsRes.data || []).slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">Track leads and team performance</p>
        </div>
        <button onClick={() => navigate('/manager/leads')} className="btn btn-primary">
          <Plus size={16} /> New Lead
        </button>
      </div>

      <div className="stats-grid">
        <StatsCard title="Total Leads" value={stats?.totalLeads} icon={ClipboardList} color="primary" />
        <StatsCard title="Assigned" value={stats?.assignedLeads} icon={CheckCircle} color="success" />
        <StatsCard title="Unassigned" value={stats?.unassignedLeads} icon={TrendingUp} color="warning" />
        <StatsCard title="My Agents" value={stats?.totalAgents} icon={Users} color="info" />
      </div>

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
                <p style={{ fontSize: 11, color: '#cbd5e0' }}>Set your Assigned City to see your region's performance</p>
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

      {/* Recent Leads */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Recent Leads</h3>
          <button onClick={() => navigate('/manager/leads')} className="btn btn-ghost btn-sm">
            View All <ArrowRight size={13} />
          </button>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Property</th>
                <th>Status</th>
                <th>Agent</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/manager/leads')}>
                  <td data-label="Client">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-accent">{getInitials(lead.name)}</div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{lead.name}</p>
                        <p style={{ fontSize: 12, color: '#9aa5b1' }}>{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Property"><span style={{ fontSize: 13, color: '#4a5568' }}>{lead.propertyType}</span></td>
                  <td data-label="Status"><span className={`badge ${LEAD_STATUS_BADGE[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span></td>
                  <td data-label="Agent">
                    {lead.agentName
                      ? <span style={{ fontSize: 13, color: '#4a5568' }}>{lead.agentName}</span>
                      : <span style={{ fontSize: 12, color: '#9aa5b1', fontStyle: 'italic' }}>Unassigned</span>
                    }
                  </td>
                  <td data-label="Date" style={{ fontSize: 13, color: '#9aa5b1' }}>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
