import { useState, useEffect } from 'react';
import TrackerView from './TrackerView';
import GoalsView from './GoalsView';
import RulesView from './RulesView';
import WealthView from './WealthView';
import HealthView from './HealthView';
import BottomNav from './BottomNav';
import Login from './Login';
import TopHeader from './TopHeader';

export default function MobileApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('tracker'); // tracker, health, wealth, goals, rules
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await window.storage?.get("tracker:auth");
        if (res && res.value === "true") setIsAuthenticated(true);
      } catch { /* ignore */ }
    };
    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <TopHeader streak={streak} onLogout={() => setIsAuthenticated(false)} />
      
      <div style={{ paddingBottom: '90px' }}>
        {activeTab === 'tracker' && <TrackerView updateStreak={setStreak} />}
        {activeTab === 'health' && <HealthView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'wealth' && <WealthView />}
        {activeTab === 'rules' && <RulesView />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
