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

export default function HealthView() {
  const [weights, setWeights] = useState({ start: "", current: "", goal: "" });
  const [calories, setCalories] = useState({ eaten: 0, goal: 2000 });
  const weightsKey = `health:weights`;

  useEffect(() => {
    const load = async () => {
      try {
        const wRes = await window.storage?.get(weightsKey);
        setWeights(wRes ? JSON.parse(wRes.value) : { start: "85", current: "79.8", goal: "75" });
      } catch { setWeights({ start: "85", current: "79.8", goal: "75" }); }
    };
    load();
  }, [weightsKey]);

  const updateWeight = async (field, val) => {
    const next = { ...weights, [field]: val };
    setWeights(next);
    try { await window.storage?.set(weightsKey, JSON.stringify(next)); } catch (e) {}
  };

  const calPct = Math.min((calories.eaten / calories.goal) * 100, 100);

  return (
    <div className="fade-up-1">
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#fff", fontFamily: "'Tajawal', sans-serif" }}>الصحة واللياقة</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#a1a1aa", fontFamily: "'Tajawal', sans-serif" }}>راقب وزنك وسعراتك بدقة.</p>
      </div>

      {/* Calories Ring / Bar */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Calories Today</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'JetBrains Mono'", display: 'flex', alignItems: 'baseline', gap: 4 }}>
              {calories.eaten} <span style={{ fontSize: 14, color: '#71717a', fontWeight: 500 }}>/ {calories.goal}</span>
            </div>
          </div>
          <button 
            onClick={() => setCalories(p => ({...p, eaten: p.eaten + 200}))}
            style={{ background: '#10b981', color: '#000', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 800, cursor: 'pointer', fontFamily: "'JetBrains Mono'" }}>
            +200
          </button>
        </div>

        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 10, width: `${calPct}%`,
            background: calPct > 100 ? "#ef4444" : "linear-gradient(90deg, #10b981, #34d399)",
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Weight Summary (Read-Only) */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Current Weight</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6', fontFamily: "'JetBrains Mono'" }}>{weights.current} kg</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Target</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', fontFamily: "'JetBrains Mono'" }}>{weights.goal} kg</div>
        </div>
      </div>

      {/* Weight Chart */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", padding: "16px 16px 0", height: 200 }}>
        <div style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Weight Trend</div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={mockWeightData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ background: 'rgba(9,9,11,0.9)', border: '1px solid #27272a', borderRadius: 8, color: '#fff' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
