import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, getDashboardPath } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldOff size={36} color="#ef4444" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#0f1923', marginBottom: 10 }}>Access Denied</h1>
        <p style={{ fontSize: 15, color: '#9aa5b1', marginBottom: 28 }}>You don't have permission to view this page.</p>
        <button onClick={() => navigate(user ? getDashboardPath(user.role) : '/login')}
          className="btn btn-primary" style={{ gap: 8 }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
