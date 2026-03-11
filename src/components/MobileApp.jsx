import { useState } from "react";
import TrackerView from "./TrackerView";
import GoalsView from "./GoalsView";
import RulesView from "./RulesView";
import WealthView from "./WealthView";
import HealthView from "./HealthView";
import BottomNav from "./BottomNav";
import TopHeader from "./TopHeader";
import SettingsModal from "./SettingsModal";
import CalendarView from "./CalendarView";

export default function MobileApp({ user }) {
  const [activeTab, setActiveTab] = useState("tracker"); // tracker, health, calendar, wealth, goals
  const [streak, setStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("pro_token");
    localStorage.removeItem("pro_user");
    window.location.reload();
  };

  return (
    <div className="app-container">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <TopHeader
        streak={streak}
        user={user}
        onLogout={handleLogout}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div
        key={activeTab}
        className="tab-view-enter"
        style={{ paddingBottom: "90px", height: "100%" }}
      >
        {activeTab === "tracker" && <TrackerView updateStreak={setStreak} />}
        {activeTab === "health" && <HealthView />}
        {activeTab === "calendar" && <CalendarView />}
        {activeTab === "goals" && <GoalsView />}
        {activeTab === "wealth" && <WealthView />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
