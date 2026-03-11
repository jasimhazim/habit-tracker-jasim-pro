import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const mockWeightData = [
  { day: 'Mon', weight: 81.2 },
  { day: 'Tue', weight: 80.9 },
  { day: 'Wed', weight: 81.0 },
  { day: 'Thu', weight: 80.5 },
  { day: 'Fri', weight: 80.2 },
  { day: 'Sat', weight: 80.0 },
  { day: 'Sun', weight: 79.8 },
];

export default function DesktopHealthView() {
  const [weights, setWeights] = useState({ start: "85", current: "79.8", goal: "80" });
  const [calories, setCalories] = useState({ eaten: 0, goal: 2000 });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('pro_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Settings for weights
        const sRes = await fetch('/api/data/settings', { headers });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData['health:weights']) setWeights(JSON.parse(sData['health:weights']));
        }

        // Today's health log for calories
        const hRes = await fetch('/api/data/health', { headers });
        if (hRes.ok) {
          const hData = await hRes.json();
          setCalories(p => ({ ...p, eaten: hData.calories || 0 }));
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const addCalories = async () => {
    const nextEaten = calories.eaten + 200;
    setCalories(p => ({ ...p, eaten: nextEaten }));
    try {
      const token = localStorage.getItem('pro_token');
      await fetch('/api/data/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ calories: nextEaten })
      });
    } catch (e) {
      console.error(e);
      setCalories(p => ({ ...p, eaten: p.eaten - 200 }));
    }
  };

  const calPct = Math.min((calories.eaten / calories.goal) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Interactive Calories Tracker */}
      <div className="premium-list-item" style={{ flexDirection: 'column', padding: 24, gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Calories Today</div>
            <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'JetBrains Mono'", display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="glow-text">{calories.eaten}</span>
              <span style={{ fontSize: 16, color: '#52525b', fontWeight: 600 }}>/ {calories.goal}</span>
            </div>
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>
              {calories.goal - calories.eaten} kcal remaining
            </div>
          </div>
          <button 
            className="premium-list-item"
            style={{ margin: 0, padding: '12px 20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.2)' }}
            onClick={addCalories}
            title="Log Meal"
          >
            +200 kcal
          </button>
        </div>

        <div style={{ height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden", width: '100%' }}>
          <div style={{
            height: "100%", borderRadius: 12, width: `${calPct}%`,
            background: calPct > 100 ? "#ef4444" : "linear-gradient(90deg, #10b981, #34d399)",
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: `0 0 20px ${calPct > 100 ? '#ef4444' : '#10b981'}88`
          }} />
        </div>
      </div>

      {/* Embedded High-Quality Weight Chart */}
      <div style={{ background: "rgba(255,255,255,0.01)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.03)", padding: "20px 20px 0", height: 260 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>7-Day Weight Trend</div>
          <div style={{ fontSize: 16, color: '#3b82f6', fontWeight: 800, fontFamily: "'JetBrains Mono'" }}>{weights.current} kg</div>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={mockWeightData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeightDesk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorWeightDesk)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
