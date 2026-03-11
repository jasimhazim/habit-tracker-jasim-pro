import { useState, useEffect } from 'react';
import TrackerView from './TrackerView';
import DesktopSidebar from './DesktopSidebar';
import DesktopHealthView from './DesktopHealthView';
import DesktopWealthView from './DesktopWealthView';
import CalendarWidget from './CalendarWidget';
import TopHeader from './TopHeader';
import SettingsModal from './SettingsModal';
import AIAgent from './AIAgent';
import { Activity, Wallet, Target, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

export default function DesktopApp() {
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الإنجاز');
    else if (hour < 18) setGreeting('مساء الطموح');
    else setGreeting('ليلة سعيدة');
  }, []);

  return (
    <div className="desktop-root ar-text">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <div className="desktop-content-wrapper">
        <div className="desktop-header-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 40, fontWeight: 900, margin: 0, color: '#fff' }}>
              {greeting}، <span className="glow-text">أيها البطل</span>
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: 16, marginTop: 8 }}>مركز القيادة الشامل، حيث تلتقي الأهداف الاستراتيجية مع الذكاء الاصطناعي.</p>
          </div>
          <TopHeader streak={streak} onLogout={() => window.location.reload()} onSettingsClick={() => setShowSettings(true)} />
        </div>

        <div className="desktop-dashboard-grid">
          {/* Left Column - Health, Wealth */}
          <div className="desktop-col-left">
            <div className="desktop-card">
              <h2 className="desktop-card-title"><Activity color="#10b981" size={24} /> مركز الصحة واللياقة</h2>
              <DesktopHealthView />
            </div>
            <div className="desktop-card">
              <h2 className="desktop-card-title"><Wallet color="#f59e0b" size={24} /> المؤشرات المالية</h2>
              <DesktopWealthView />
            </div>
          </div>

          {/* Middle Column - Calendar and Tracker */}
          <div className="desktop-col-main">
            <CalendarWidget />
            <div className="desktop-card">
              <h2 className="desktop-card-title"><Target className="glow-text" size={24} /> سجل العادات اليومية</h2>
              <TrackerView updateStreak={setStreak} />
            </div>
          </div>

          {/* Right Column - Goals Sidebar & AI Agent */}
          <div className="desktop-col-right">
            <DesktopSidebar />
            <div className="desktop-card" style={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column', padding: 24 }}>
              <AIAgent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
