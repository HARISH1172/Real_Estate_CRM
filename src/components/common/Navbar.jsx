import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Navbar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowProfile(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColors = {
    ADMIN:   { bg: '#fdf3e0', color: '#b45309' },
    MANAGER: { bg: '#dbeafe', color: '#2563eb' },
    AGENT:   { bg: '#dcfce7', color: '#16a34a' },
  };
  const rc = roleColors[user?.role] || roleColors.AGENT;

  return (
    <header className="navbar-container" style={{ height: 64, background: 'white', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuClick} className="nav-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#0f1923', padding: 4 }}>
          <Menu size={22} />
        </button>
        {title && <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0f1923' }}>{title}</h2>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Role pill */}
        <span style={{ padding: '3px 11px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: rc.bg, color: rc.color }}>{user?.role}</span>


        {/* Profile dropdown */}
        <div style={{ position: 'relative' }} ref={dropRef}>
          <button onClick={() => setShowProfile(!showProfile)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f6fa', border: '1.5px solid #e8eaed', borderRadius: 10, padding: '5px 10px 5px 5px', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1a3c5e,#2d5f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>
              {getInitials(user?.name || 'U')}
            </div>
            <div style={{ textAlign: 'left' }}>
              {/* user.name from User entity */}
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1923', lineHeight: 1.2 }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: 11, color: '#9aa5b1' }}>{user?.email?.split('@')[0]}</p>
            </div>
            <ChevronDown size={13} color="#9aa5b1" />
          </button>

          {showProfile && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #e8eaed', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', minWidth: 200, padding: 8, zIndex: 200, animation: 'scaleIn 0.15s ease' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f2f5', marginBottom: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1923' }}>{user?.name}</p>
                <p style={{ fontSize: 12, color: '#9aa5b1' }}>{user?.email}</p>
                <p style={{ fontSize: 11, color: '#9aa5b1', marginTop: 2 }}>{user?.phone}</p>
              </div>
              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
