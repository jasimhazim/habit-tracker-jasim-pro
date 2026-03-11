import { useState } from 'react';
import TrackerView from './TrackerView';
import GoalsView from './GoalsView';
import RulesView from './RulesView';
import WealthView from './WealthView';
import HealthView from './HealthView';
import BottomNav from './BottomNav';
import TopHeader from './TopHeader';

export default function MobileApp({ user }) {
  const [activeTab, setActiveTab] = useState('tracker'); // tracker, health, wealth, goals, rules
  const [streak, setStreak] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('pro_token');
    localStorage.removeItem('pro_user');
    window.location.reload();
  };

  return (
    <div className="app-container">
      <TopHeader streak={streak} user={user} onLogout={handleLogout} />
      
      <div key={activeTab} className="tab-view-enter" style={{ paddingBottom: '90px' }}>
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
