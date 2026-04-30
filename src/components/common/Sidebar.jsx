import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, UserCheck, ClipboardList,
  LogOut, Building2, ChevronLeft, ChevronRight,
  Shield, UserCog, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/managers', label: 'Managers', icon: Briefcase },
  { to: '/admin/agents', label: 'Agents', icon: UserCheck },
  { to: '/admin/leads', label: 'All Leads', icon: ClipboardList },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
];
const managerLinks = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/leads', label: 'All Leads', icon: ClipboardList },
  { to: '/manager/agents', label: 'My Agents', icon: Users },
  { to: '/manager/properties', label: 'Properties', icon: Building2 },
];
const agentLinks = [
  { to: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agent/leads', label: 'My Leads', icon: ClipboardList },
  { to: '/agent/properties', label: 'Properties', icon: Building2 },
];

const roleConfig = {
  [ROLES.ADMIN]: { links: adminLinks, label: 'Administrator', icon: Shield, color: '#e8a838' },
  [ROLES.MANAGER]: { links: managerLinks, label: 'Manager', icon: Briefcase, color: '#3b82f6' },
  [ROLES.AGENT]: { links: agentLinks, label: 'Agent', icon: UserCheck, color: '#22c55e' },
};

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const config = roleConfig[user?.role] || { links: [], label: 'User', icon: Shield, color: '#fff' };
  const { links, label, icon: RoleIcon, color } = config;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '22px 0' : '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#e8a838,#c8882a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={18} color="white" />
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'white', lineHeight: 1.1 }}>EstateFlow</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', fontWeight: 500, letterSpacing: '0.06em' }}>CRM PLATFORM</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, padding: '5px 12px' }}>
            <RoleIcon size={11} color={color} />
            <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, label: lbl, icon: Icon }) => (
          <NavLink key={to} to={to} title={collapsed ? lbl : undefined}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '11px 0' : '11px 13px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              color: isActive ? 'white' : 'rgba(168,184,200,0.85)',
              background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 14,
              transition: 'all 0.18s', textDecoration: 'none',
              borderLeft: isActive ? '3px solid #e8a838' : '3px solid transparent',
            })}>
            <Icon size={18} strokeWidth={1.8} />
            {!collapsed && <span>{lbl}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1a3c5e,#e8a838)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
              {getInitials(user?.name || 'U')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} title="Logout"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', width: '100%', background: 'transparent', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.35)', fontSize: 14, cursor: 'pointer', transition: 'all 0.18s', justifyContent: collapsed ? 'center' : 'flex-start' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="sidebar-toggle-btn"
        style={{ position: 'absolute', top: 28, right: -12, width: 24, height: 24, borderRadius: '50%', background: '#1a3c5e', border: '2px solid #0f1923', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;
