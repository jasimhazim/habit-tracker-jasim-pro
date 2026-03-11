import { Home, Target, Activity, Wallet, FileText } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'tracker', icon: Home, label: 'Tracker' },
    { id: 'health', icon: Activity, label: 'Health' },
    { id: 'wealth', icon: Wallet, label: 'Wealth' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'rules', icon: FileText, label: 'Rules' },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="bottom-nav-container" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 20px)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '12px 0 calc(12px + env(safe-area-inset-bottom, 16px))',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            aria-label={`Switch to ${tab.label} tab`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? '#f59e0b' : '#71717a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '0 12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ 
              fontSize: '10px', 
              fontWeight: isActive ? 700 : 500,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#f59e0b'
              }} />
            )}
          </button>
        )
      })}
    </nav>
  );
}
