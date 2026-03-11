import {
  Home,
  Target,
  Activity,
  Wallet,
  FileText,
  Settings,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function DesktopNav({
  activeTab,
  setActiveTab,
  onSettingsClick,
}) {
  const tabs = [
    { id: "dashboard", icon: Home, label: "لوحة القيادة" },
    { id: "tracker", icon: Target, label: "العادات" },
    { id: "health", icon: Activity, label: "الصحة" },
    { id: "wealth", icon: Wallet, label: "الثروة" },
    { id: "calendar", icon: CalendarIcon, label: "المواعيد" },
    { id: "goals", icon: Sparkles, label: "الأهداف" },
    { id: "rules", icon: FileText, label: "القواعد" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "rgba(9, 9, 11, 0.6)",
        padding: "24px 16px",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        minWidth: 240,
        height: "100%",
      }}
    >
      <div style={{ marginBottom: 32, padding: "0 12px" }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -1,
            margin: 0,
          }}
        >
          ⚡ Habit PRO
        </h2>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: isActive
                  ? "rgba(99, 102, 241, 0.15)"
                  : "transparent",
                border: "none",
                borderRadius: 12,
                color: isActive ? "#818cf8" : "#a1a1aa",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "right",
                width: "100%",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#e4e4e7";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#a1a1aa";
                }
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 16,
        }}
      >
        <button
          onClick={onSettingsClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            borderRadius: 12,
            color: "#a1a1aa",
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "right",
            width: "100%",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#e4e4e7";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#a1a1aa";
          }}
        >
          <Settings size={20} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            الإعدادات
          </span>
        </button>
      </div>
    </div>
  );
}
