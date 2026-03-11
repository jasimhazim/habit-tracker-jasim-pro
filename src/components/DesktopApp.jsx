import { useState, useEffect } from "react";
import TrackerView from "./TrackerView";
import DesktopSidebar from "./DesktopSidebar";
import DesktopHealthView from "./DesktopHealthView";
import DesktopWealthView from "./DesktopWealthView";
import CalendarWidget from "./CalendarWidget";
import TopHeader from "./TopHeader";
import SettingsModal from "./SettingsModal";
import AIAgent from "./AIAgent";
import DesktopNav from "./DesktopNav";
import HealthView from "./HealthView";
import WealthView from "./WealthView";
import GoalsView from "./GoalsView";
import RulesView from "./RulesView";
import CalendarView from "./CalendarView";
import { Activity, Wallet, Target } from "lucide-react";

export default function DesktopApp({ user }) {
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("صباح الإنجاز");
    else if (hour < 18) setGreeting("مساء الطموح");
    else setGreeting("ليلة سعيدة");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pro_token");
    localStorage.removeItem("pro_user");
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="desktop-dashboard-grid fade-up">
            <div className="desktop-col-left">
              <div className="desktop-card">
                <h2 className="desktop-card-title">
                  <Activity color="#10b981" size={24} /> مركز الصحة واللياقة
                </h2>
                <DesktopHealthView />
              </div>
              <div className="desktop-card">
                <h2 className="desktop-card-title">
                  <Wallet color="#f59e0b" size={24} /> المؤشرات المالية
                </h2>
                <DesktopWealthView />
              </div>
            </div>
            <div className="desktop-col-main">
              <CalendarWidget />
              <div className="desktop-card">
                <h2 className="desktop-card-title">
                  <Target className="glow-text" size={24} /> سجل العادات اليومية
                </h2>
                <TrackerView updateStreak={setStreak} />
              </div>
            </div>
            <div className="desktop-col-right">
              <DesktopSidebar />
              <div
                className="desktop-card"
                style={{
                  flex: 1,
                  minHeight: 400,
                  display: "flex",
                  flexDirection: "column",
                  padding: 24,
                }}
              >
                <AIAgent />
              </div>
            </div>
          </div>
        );
      case "tracker":
        return (
          <div className="fade-up" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <TrackerView updateStreak={setStreak} />
          </div>
        );
      case "health":
        return (
          <div className="fade-up" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <HealthView />
          </div>
        );
      case "wealth":
        return (
          <div className="fade-up" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <WealthView />
          </div>
        );
      case "calendar":
        return (
          <div
            className="fade-up"
            style={{ maxWidth: 1000, margin: "0 auto", height: "100%" }}
          >
            <CalendarView />
          </div>
        );
      case "goals":
        return (
          <div className="fade-up" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <GoalsView />
          </div>
        );
      case "rules":
        return (
          <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto" }}>
            <RulesView />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="desktop-root ar-text"
      style={{ padding: 0, display: "flex", flexDirection: "row-reverse" }}
    >
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Right Sidebar Navigation (RTL layout) */}
      <DesktopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Content Area */}
      <div
        className="desktop-content-wrapper"
        style={{ flex: 1, overflowY: "auto", padding: "32px 48px" }}
      >
        <div
          className="desktop-header-area"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 900,
                margin: 0,
                color: "#fff",
              }}
            >
              {greeting}،{" "}
              <span className="glow-text">
                {user?.displayName?.split(" ")[0] || "أيها البطل"}
              </span>
            </h1>
            <p style={{ color: "#a1a1aa", fontSize: 16, marginTop: 8 }}>
              مركز القيادة الشامل، حيث تلتقي الأهداف الاستراتيجية مع الذكاء
              الاصطناعي.
            </p>
          </div>
          <TopHeader streak={streak} user={user} onLogout={handleLogout} />
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
