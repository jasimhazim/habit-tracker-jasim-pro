import { useState, useEffect } from "react";

export default function DesktopSidebar() {
  const [goals, setGoals] = useState({});
  const [weights, setWeights] = useState({ start: "85", current: "79.8", goal: "75" });
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
  // 1. Weight Progress
  const startWeight = parseFloat(weights.start) || 85;
  const currentWeight = parseFloat(weights.current) || 79.8;
  const goalWeight = parseFloat(weights.goal) || 75;
  const totalWeightToLose = startWeight - goalWeight;
  const weightLost = startWeight - currentWeight;
  let weightPct = 0;
  if (totalWeightToLose > 0) {
    weightPct = Math.min(Math.max((weightLost / totalWeightToLose) * 100, 0), 100);
  }

  // 2. Expenses Progress (Reverse progress, closer to 100% is bad, we want remaining)
  const budgetUsedPct = Math.min((currentSpend / monthlyBudget) * 100, 100);

  // 3. Education / Study (Mocking progress from habits)
  const studyPct = 85; 

  const GoalCard = ({ title, icon, value, target, pct, color, desc }) => (
    <div style={{
      background: "rgba(255,255,255,0.03)", borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.08)", padding: 20,
      display: "flex", flexDirection: "column", gap: 12
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: `rgba(${color},0.15)`,
            color: `rgb(${color})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
          }}>{icon}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#a1a1aa", fontFamily: "'Tajawal', sans-serif" }}>{desc}</div>
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: `rgb(${color})` }}>
          {Math.round(pct)}<span style={{ fontSize: 14 }}>%</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>
        <span style={{ fontFamily: "'JetBrains Mono'" }}>{value}</span>
        <span style={{ fontFamily: "'JetBrains Mono'" }}>{target}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 10, width: `${pct}%`,
          background: `rgb(${color})`, transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );

  return (
    <div className="desktop-sidebar fade-up ar-text">
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>لوحة القيادة والمؤشرات</h2>
        <p style={{ margin: 0, fontSize: 15, color: "#a1a1aa", lineHeight: 1.6 }}>متابعة فورية لأهم 3 أهداف استراتيجية. الأرقام لا تكذب.</p>
      </div>

      <GoalCard 
        title="الوزن والصحة" 
        desc="الهدف الشهري للوصول للوزن المثالي"
        icon="⚖️" 
        value={`${currentWeight} kg`} 
        target={`${goalWeight} kg`} 
        pct={weightPct} 
        color="16, 185, 129" // Emerald
      />

      <GoalCard 
        title="النفقات والميزانية" 
        desc="الاستهلاك الشهري من الميزانية المحددة"
        icon="💳" 
        value={`$${currentSpend}`} 
        target={`$${monthlyBudget}`} 
        pct={budgetUsedPct} 
        color="245, 158, 11" // Amber
      />

      <GoalCard 
        title="التعليم والتطور" 
        desc="نسبة إنجاز ساعات الدراسة المخططة"
        icon="🧠" 
        value={`${Math.round((studyPct / 100) * 40)} hrs`} 
        target={`40 hrs`} 
        pct={studyPct} 
        color="99, 102, 241" // Indigo
      />

      {/* Monthly Goals Text Summaries */}
      <div style={{
        marginTop: 16, background: "rgba(255,255,255,0.02)", borderRadius: 20,
        border: "1px dashed rgba(255,255,255,0.1)", padding: 20
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", color: "#e4e4e7" }}>الأهداف الشهرية المكتوبة</h3>
        {["health", "fin", "edu"].map(catId => {
          const text = goals[`${catId}-monthly`];
          const titles = { health: "الصحة", fin: "المال", edu: "التعليم" };
          return (
            <div key={catId} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 700, marginBottom: 4 }}>{titles[catId]}</div>
              <div style={{ fontSize: 14, color: text ? "#fff" : "#52525b" }}>{text || "لم يتم تحديد هدف شهري بعد."}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
