import { useState, useEffect } from 'react';
import './index.css';
import TrackerView from './components/TrackerView';
import GoalsView from './components/GoalsView';
import RulesView from './components/RulesView';
import WealthView from './components/WealthView';
import HealthView from './components/HealthView';
import BottomNav from './components/BottomNav';
import Login from './components/Login';
import TopHeader from './components/TopHeader';

import DesktopSidebar from './components/DesktopSidebar';

export default function App() {
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
    <div className="app-wrapper">
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

      <DesktopSidebar />
    </div>
  );
}
