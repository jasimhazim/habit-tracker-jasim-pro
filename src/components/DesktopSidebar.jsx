import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

export default function DesktopSidebar() {
  const [goals, setGoals] = useState({});
  const [weights, setWeights] = useState({ start: "85", current: "79.8", goal: "80" });
  const [calories, setCalories] = useState({ eaten: 1500, goal: 2000 });
  
  // Plaid Mock Data for Expenses Goal
  const monthlyBudget = 2000;
  const currentSpend = 1770;

  useEffect(() => {
    const load = async () => {
      try {
        const gRes = await window.storage?.get(`goals:data`);
        setGoals(gRes ? JSON.parse(gRes.value) : {});
      } catch { setGoals({}); }

      try {
        const wRes = await window.storage?.get(`health:weights`);
        if (wRes) setWeights(JSON.parse(wRes.value));
      } catch {}
    };
    load();
  }, []);

  // Calculate Progress Percentages
  const startWeight = parseFloat(weights.start) || 85;
  const currentWeight = parseFloat(weights.current) || 79.8;
  const goalWeight = parseFloat(weights.goal) || 75;
  const totalWeightToLose = startWeight - goalWeight;
  const weightLost = startWeight - currentWeight;
  const weightPct = totalWeightToLose > 0 ? Math.min(Math.max((weightLost / totalWeightToLose) * 100, 0), 100) : 0;

  const budgetUsedPct = Math.min((currentSpend / monthlyBudget) * 100, 100);
  const studyPct = 85; 

  const PremiumRingCard = ({ title, icon, value, target, pct, colorHex, desc }) => {
    const data = [
      { name: 'Achieved', value: pct },
      { name: 'Remaining', value: 100 - pct }
    ];
    
    return (
      <div className="premium-list-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16, background: `${colorHex}22`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              boxShadow: `0 0 20px ${colorHex}11`
            }}>{icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Tajawal', sans-serif", color: "#fff" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#a1a1aa", fontFamily: "'Tajawal', sans-serif" }}>{desc}</div>
            </div>
          </div>
          
          <div style={{ width: 64, height: 64, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={22}
                  outerRadius={30}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  <Cell fill={colorHex} />
                  <Cell fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: colorHex
            }}>
              {Math.round(pct)}<span style={{fontSize: 10}}>%</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 13, fontFamily: "'JetBrains Mono'" }}>
          <div style={{ color: "#e4e4e7" }}><span style={{color: "#71717a", fontSize: 11, marginRight: 6}}>CURRENT</span>{value}</div>
          <div style={{ color: colorHex }}><span style={{color: "#71717a", fontSize: 11, marginRight: 6}}>TARGET</span>{target}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="desktop-card fade-up ar-text" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 className="desktop-card-title"><Target color="#f4f4f5" size={24} /> الأهداف الاستراتيجية</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <PremiumRingCard 
          title="الوزن والصحة" 
          desc="الوصول للوزن المثالي"
          icon="⚖️" 
          value={`${currentWeight} kg`} 
          target={`${goalWeight} kg`} 
          pct={weightPct} 
          colorHex="#10b981" // Emerald
        />

        <PremiumRingCard 
          title="النفقات والميزانية" 
          desc="الاستهلاك من الميزانية"
          icon="💳" 
          value={`CAD ${currentSpend}`} 
          target={`CAD ${monthlyBudget}`} 
          pct={budgetUsedPct} 
          colorHex="#f59e0b" // Amber
        />

        <PremiumRingCard 
          title="التعليم والتطور" 
          desc="إنجاز ساعات الدراسة"
          icon="🧠" 
          value={`${Math.round((studyPct / 100) * 40)} hrs`} 
          target={`40 hrs`} 
          pct={studyPct} 
          colorHex="#6366f1" // Indigo
        />
      </div>

      <div style={{
        marginTop: 24, background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", 
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 24,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", color: "#e4e4e7" }}>نوايا الشهر الحالي</h3>
        {["health", "fin", "edu"].map((catId, idx) => {
          const text = goals[`${catId}-monthly`];
          const titles = { health: "الصحة البدنية", fin: "الثروة والاستثمار", edu: "التطور العقلي" };
          const colors = { health: "#10b981", fin: "#f59e0b", edu: "#6366f1" };
          return (
            <div key={catId} style={{ marginBottom: idx === 2 ? 0 : 16, paddingBottom: idx === 2 ? 0 : 16, borderBottom: idx === 2 ? 'none' : "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[catId], boxShadow: `0 0 8px ${colors[catId]}` }} />
                <div style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 700 }}>{titles[catId]}</div>
              </div>
              <div style={{ fontSize: 15, color: text ? "#fff" : "#52525b", lineHeight: 1.5, paddingRight: 16 }}>
                {text || "لم يتم تحديد رؤية لهذا المسار بعد."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
