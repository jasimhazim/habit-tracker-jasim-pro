import { User as UserIcon, LogOut, Settings } from 'lucide-react';

export default function TopHeader({ streak, onLogout, onSettingsClick, user }) {
  return (
    <header className="fade-up" style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* User Avatar */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', padding: '4px 12px 4px 4px', borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)' }}>
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={18} color="#fff" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: "'Tajawal', sans-serif" }}>{user.displayName || 'بطل برو'}</span>
              <span style={{ color: '#a1a1aa', fontSize: 10, fontFamily: "'JetBrains Mono'", letterSpacing: 0.5 }}>PRO MEMBER</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>⚡ PRO</span>
            </div>
            <div className="ar-text" style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4, fontWeight: 500 }}>
              لا أعذار · لا طرق مختصرة
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(245,158,11,0.2)' }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 14 }}>{streak}</span>
          </div>
        )}
        
        {onSettingsClick && (
          <button 
            aria-label="Open Settings"
            onClick={onSettingsClick}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, transition: 'color 0.2s', outlineOffset: '4px' }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#a1a1aa'}
          >
            <Settings size={20} />
          </button>
        )}

        <button 
          aria-label="Logout"
          onClick={async () => {
          try { await window.storage?.set("tracker:auth", "false"); } catch (e) {}
          onLogout();
        }} style={{
          background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444",
          padding: "6px 12px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontWeight: 700, outlineOffset: '4px'
        }}>خروج</button>
      </div>
    </header>
  );
}
