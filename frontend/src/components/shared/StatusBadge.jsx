const STATUS_CONFIG = {
  'Pending':            { bg: '#ffedd5', border: '#fdba74', text: '#c2410c', dot: '#ea580c' },
  'Accepted':           { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca', dot: '#4f46e5' },
  'Worker On The Way':  { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1', dot: '#0ea5e9' },
  'Work Started':       { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9', dot: '#8b5cf6' },
  'Work Completed':     { bg: '#ccfbf1', border: '#5eead4', text: '#0f766e', dot: '#14b8a6' },
  'Payment Pending':    { bg: '#fef3c7', border: '#fcd34d', text: '#b45309', dot: '#f59e0b' },
  'Finished':           { bg: '#d1fae5', border: '#6ee7b7', text: '#047857', dot: '#10b981' },
  'Cancelled':          { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', dot: '#ef4444' },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] || { bg: '#f3f4f6', border: '#d1d5db', text: '#374151', dot: '#9ca3af' };
  const textSize = size === 'sm' ? '10px' : '12px';
  const py = size === 'sm' ? '4px' : '6px';
  const px = size === 'sm' ? '12px' : '16px';
  
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-widest shadow-sm"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        fontSize: textSize,
        padding: `${py} ${px}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
