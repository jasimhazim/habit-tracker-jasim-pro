import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Link2, ExternalLink } from 'lucide-react';

export default function CalendarWidget() {
  const [time, setTime] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: 'Deep Work: Coding V3', time: '10:00 AM', type: 'focus' },
    { id: 2, title: 'Gym Session', time: '5:30 PM', type: 'health' },
    { id: 3, title: 'Read 20 Pages', time: '9:00 PM', type: 'habit' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-SA', options);
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'focus': return '#6366f1';
      case 'health': return '#10b981';
      case 'habit': return '#f59e0b';
      default: return '#71717a';
    }
  };

  return (
    <div className="desktop-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <CalendarIcon color="#f59e0b" size={28} />
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#fff', fontFamily: "'Tajawal', sans-serif" }}>اليوم</h2>
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "'Tajawal', sans-serif", letterSpacing: -1, lineHeight: 1.2, color: '#f4f4f5' }}>
            {time.getDate()} <span style={{ color: '#f59e0b' }}>{time.toLocaleDateString('ar-SA', { month: 'long' })}</span>
          </div>
          <div style={{ fontSize: 18, color: '#a1a1aa', fontFamily: "'Tajawal', sans-serif", marginTop: 4 }}>
            {time.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric' })}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', color: '#a1a1aa', marginBottom: 8 }}>
            <Clock size={16} />
            <span style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Local Time</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: '#fff' }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#e4e4e7', fontFamily: "'Tajawal', sans-serif" }}>أجندة اليوم</h3>
          <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            <Link2 size={16} /> ربط Google Calendar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((ev, i) => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: getTypeColor(ev.type) }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Tajawal', sans-serif" }}>{ev.title}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: '#71717a' }}>{ev.time}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', color: '#71717a', width: '100%', padding: '12px', borderRadius: 12, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", fontSize: 13, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#71717a'}>
              + إضافة موعد يدوي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
