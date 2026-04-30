const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
  const colorMap = {
    primary: { bg: 'var(--primary-lighter)', color: 'var(--primary)', accent: 'var(--primary)' },
    accent: { bg: 'var(--accent-light)', color: '#b45309', accent: 'var(--accent)' },
    success: { bg: 'var(--success-light)', color: '#16a34a', accent: 'var(--success)' },
    danger: { bg: 'var(--danger-light)', color: '#dc2626', accent: 'var(--danger)' },
    info: { bg: 'var(--info-light)', color: '#2563eb', accent: 'var(--info)' },
    warning: { bg: 'var(--warning-light)', color: '#d97706', accent: 'var(--warning)' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            {title}
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {value ?? '—'}
          </p>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              marginTop: 8,
              color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: c.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: c.color,
          flexShrink: 0,
        }}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
