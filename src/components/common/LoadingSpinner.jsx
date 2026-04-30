
const LoadingSpinner = ({ fullScreen, size = 36, message }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <path
          d="M18 3 A15 15 0 0 1 33 18"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {message && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
    }}>
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
