export default function TopHeader({ streak, onLogout }) {
  return (
    <div className="fade-up" style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)"
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>⚡ PRO</span>
          {streak > 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#f59e0b",
              background: "rgba(245,158,11,0.15)", padding: "2px 8px",
              borderRadius: 20, fontWeight: 700,
            }}>🔥 {streak}w</span>
          )}
        </div>
        <div className="ar-text" style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4, fontWeight: 500 }}>
          لا أعذار · لا طرق مختصرة
        </div>
      </div>
      <div>
        <button onClick={async () => {
          try { await window.storage?.set("tracker:auth", "false"); } catch (e) {}
          onLogout();
        }} style={{
          background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa",
          padding: "6px 12px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontFamily: "'Tajawal', sans-serif"
        }}>خروج</button>
      </div>
    </div>
  );
}
