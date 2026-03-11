import { useState, useEffect, useCallback } from "react";

const HABITS = [
  { id: "gym", icon: "🏋️", name: "Gym", sub: "45 min min", priority: true },
  { id: "food", icon: "🥗", name: "Diet", sub: "1800–2000 cal", priority: true },
  { id: "study", icon: "📖", name: "Study", sub: "1hr library", priority: false },
  { id: "sleep", icon: "😴", name: "Sleep", sub: "11PM–6AM", priority: false },
  { id: "water", icon: "💧", name: "Water", sub: "3L daily", priority: false },
  { id: "tidy", icon: "🧹", name: "Tidy", sub: "15 min", priority: false },
  { id: "phone", icon: "📵", name: "Phone", sub: "Limits AM/PM", priority: false },
  { id: "spend", icon: "💰", name: "Spend", sub: "Log expense", priority: false },
];

const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const RULES = [
  { title: "قاعدة الـ 5 دقائق", desc: "أي مهمة (تنظيف، ترتيب) تستغرق أقل من 5 دقائق، تُنفذ فوراً ولا تُجدول.", icon: "⏱️" },
  { title: "قاعدة الـ 3 ثوانٍ", desc: "قبل الرد في أي حوار اجتماعي، انتظر 3 ثوانٍ. يمنحك الرزانة ويمنع الاندفاع.", icon: "🧘‍♂️" },
  { title: "قاعدة الـ 10 دقائق حركة", desc: "بعد كل وجبة، تحرك لـ 10 دقائق (مشي أو ترتيب) لكسر الخمول ومنع التشتت.", icon: "🚶‍♂️" },
  { title: "قاعدة البيئة الواحدة", desc: "الدراسة في المكتبة، والبيت للراحة فقط. لا تخلط بين بيئة الإنجاز والاسترخاء.", icon: "🏛️" },
  { title: "قاعدة التجهيز المسبق", desc: "الأكل والملابس وحقيبة الجم تُجهز ليلاً. تقليل القرارات يوفر طاقة تركيزك.", icon: "🎒" }
];

const GOAL_CATEGORIES = [
  { id: "health", icon: "❤️", title: "أهداف صحية" },
  { id: "edu", icon: "🧠", title: "تعليمية وتطورية" },
  { id: "fin", icon: "💵", title: "أهداف مالية" }
];

const GOAL_PERIODS = [
  { id: "yearly", title: "الهدف السنوي" },
  { id: "monthly", title: "الهدف الشهري" },
  { id: "weekly", title: "الهدف الأسبوعي" }
];

const getWeekKey = (offset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const saturdayOffset = dayOfWeek >= 6 ? dayOfWeek - 6 : dayOfWeek + 1;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() - saturdayOffset + offset * 7);
  const y = saturday.getFullYear();
  const m = String(saturday.getMonth() + 1).padStart(2, "0");
  const d = String(saturday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getWeekLabel = (weekKey) => {
  const [y, m, d] = weekKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (dt) =>
    dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
};

export default function HabitTracker() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState({});
  const [weights, setWeights] = useState({ start: "", end: "" });
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [animatingCell, setAnimatingCell] = useState(null);
  const [activeTab, setActiveTab] = useState("tracker"); // tracker, rules, goals

  const weekKey = getWeekKey(weekOffset);
  const storageKey = `tracker:${weekKey}`;
  const weightsKey = `weights:${weekKey}`;
  const goalsKey = `goals:data`;

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await window.storage.get(storageKey);
        setData(res ? JSON.parse(res.value) : {});
      } catch { setData({}); }

      try {
        const wRes = await window.storage.get(weightsKey);
        setWeights(wRes ? JSON.parse(wRes.value) : { start: "", end: "" });
      } catch { setWeights({ start: "", end: "" }); }

      try {
        const gRes = await window.storage.get(goalsKey);
        setGoals(gRes ? JSON.parse(gRes.value) : {});
      } catch { setGoals({}); }

      setLoading(false);
    };
    load();
  }, [storageKey, weightsKey, goalsKey]);

  // Compute streak
  useEffect(() => {
    const computeStreak = async () => {
      let s = 0;
      for (let i = 0; i >= -52; i--) {
        const wk = getWeekKey(i);
        const key = `tracker:${wk}`;
        try {
          const res = await window.storage.get(key);
          if (res) {
            const d = JSON.parse(res.value);
            const total = Object.values(d).filter(Boolean).length;
            if (total >= 40) s++;
            else if (i < 0) break;
          } else if (i < 0) break;
        } catch { if (i < 0) break; }
      }
      setStreak(s);
    };
    computeStreak();
  }, [data, weekOffset]);

  const toggle = useCallback(async (habitId, dayIdx) => {
    const key = `${habitId}-${dayIdx}`;
    setAnimatingCell(key);
    setTimeout(() => setAnimatingCell(null), 400);
    const next = { ...data, [key]: !data[key] };
    setData(next);
    try { await window.storage.set(storageKey, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, [data, storageKey]);

  const updateWeight = useCallback(async (field, val) => {
    const next = { ...weights, [field]: val };
    setWeights(next);
    try { await window.storage.set(weightsKey, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, [weights, weightsKey]);

  const updateGoal = useCallback(async (catId, periodId, val) => {
    const next = { ...goals, [`${catId}-${periodId}`]: val };
    setGoals(next);
    try { await window.storage.set(goalsKey, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, [goals, goalsKey]);

  const totalChecked = Object.values(data).filter(Boolean).length;
  const maxScore = HABITS.length * 7;
  const pct = Math.round((totalChecked / maxScore) * 100);

  const todayDayIdx = (() => {
    const d = new Date().getDay();
    return d === 6 ? 0 : d + 1;
  })();

  const isCurrentWeek = weekOffset === 0;

  const getHabitScore = (habitId) => DAYS.reduce((sum, _, i) => sum + (data[`${habitId}-${i}`] ? 1 : 0), 0);
  const getDayScore = (dayIdx) => HABITS.reduce((sum, h) => sum + (data[`${h.id}-${dayIdx}`] ? 1 : 0), 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090b",
      color: "#f4f4f5",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      padding: "0",
      overflowX: "hidden",
      WebkitTapHighlightColor: "transparent",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800;9..40,900&family=JetBrains+Mono:wght@400;600;700&family=Tajawal:wght@400;500;700;800&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; background: #09090b; }

        @keyframes checkPop {
          0% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cell-anim { animation: checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
        
        /* Staggered animations */
        .fade-up-1 { animation: fadeUp 0.4s ease-out 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.4s ease-out 0.1s both; }
        .fade-up-3 { animation: fadeUp 0.4s ease-out 0.15s both; }

        .habit-row { transition: background 0.2s; }
        .habit-row:active { background: rgba(255,255,255,0.04) !important; }
        .check-btn { transition: transform 0.15s ease; cursor: pointer; touch-action: manipulation; }
        .check-btn:active { transform: scale(0.85); }

        .nav-btn { 
          transition: all 0.2s; cursor: pointer; border: none; 
          background: rgba(255,255,255,0.06); color: #a1a1aa; border-radius: 10px;
          width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .nav-btn:active { background: rgba(255,255,255,0.15); color: #fff; transform: scale(0.95); }

        .weight-input {
          background: transparent; border: none; border-bottom: 1.5px dashed #52525b;
          color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px;
          font-weight: 700; width: 45px; text-align: center; outline: none;
          padding: 2px 0; transition: border-color 0.2s; border-radius: 0;
        }
        .weight-input:focus { border-color: #f59e0b; }
        .weight-input::placeholder { color: #3f3f46; }

        .app-container {
          max-width: 440px; /* iPhone Pro Max width approx 430px */
          margin: 0 auto;
          padding: 16px 14px 100px;
        }
        
        .tab-btn {
          flex: 1; text-align: center; padding: 12px 0; font-size: 13px; font-weight: 700;
          color: #71717a; border-radius: 12px; transition: all 0.25s;
          display: flex; flex-direction: column; align-items: center; gap: 4px; border: none; background: transparent;
        }
        .tab-btn.active { color: #fff; background: rgba(255,255,255,0.06); }
        .tab-btn:active { transform: scale(0.95); }
        .tab-icon { font-size: 20px; }

        .ar-text { font-family: 'Tajawal', sans-serif; direction: rtl; }
        .goal-input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #fff; font-family: 'Tajawal', sans-serif; font-size: 14px; padding: 10px 12px;
          border-radius: 10px; outline: none; margin-top: 6px; resize: none; direction: rtl; line-height: 1.5;
          transition: border-color 0.2s, background 0.2s;
        }
        .goal-input:focus { border-color: #6366f1; background: rgba(99,102,241,0.05); }
        .goal-input::placeholder { color: #52525b; }

      `}</style>

      <div className="app-container">

        {/* ── Header ── */}
        <div className="fade-up" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>⚡ PRO</span>
              {streak > 0 && (
                <span style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#f59e0b",
                  background: "rgba(245,158,11,0.15)", padding: "2px 8px",
                  borderRadius: 20, fontWeight: 700,
                }}>🔥 {streak}w</span>
              )}
            </div>
            <div className="ar-text" style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4, fontWeight: 500 }}>
              لا أعذار · لا طرق مختصرة
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {["start", "end"].map((f) => (
              <div key={f} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "6px 10px", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#71717a",
                  textTransform: "uppercase", letterSpacing: 1, marginBottom: 2,
                }}>{f === "start" ? "Start" : "End"} kg</div>
                <input className="weight-input" type="number" step="0.1" placeholder="—"
                  value={weights[f]} onChange={(e) => updateWeight(f, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="fade-up" style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.02)", padding: 6, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
          <button className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>
            <span className="tab-icon">🎯</span> <span style={{ fontSize: 10 }}>Tracker</span>
          </button>
          <button className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
            <span className="tab-icon">🚀</span> <span className="ar-text" style={{ fontSize: 11 }}>الأهداف</span>
          </button>
          <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
            <span className="tab-icon">📜</span> <span className="ar-text" style={{ fontSize: 11 }}>القواعد</span>
          </button>
        </div>

        {/* ======================= TRACKER VIEW ======================= */}
        {activeTab === 'tracker' && (
          <div className="fade-up-1">
            {/* Week Nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button className="nav-btn" onClick={() => setWeekOffset((p) => p - 1)}>&lt;</button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {getWeekLabel(weekKey)}
                  {isCurrentWeek && <span style={{ marginLeft: 6, fontSize: 9, color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: 8, fontWeight: 700 }}>NOW</span>}
                </div>
              </div>
              <button className="nav-btn" onClick={() => setWeekOffset((p) => Math.min(p + 1, 0))}>&gt;</button>
            </div>

            {/* Progress */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 10, width: `${pct}%`,
                    background: pct >= 89 ? "linear-gradient(90deg, #f59e0b, #ef4444)" : pct >= 71 ? "linear-gradient(90deg, #10b981, #059669)" : pct >= 50 ? "#3b82f6" : "#71717a",
                    transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                  }} />
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 900, minWidth: 60, textAlign: "right", letterSpacing: -0.5 }}>
                {totalChecked}<span style={{ fontSize: 11, fontWeight: 500, color: "#71717a" }}>/{maxScore}</span>
              </div>
            </div>

            {/* GRID */}
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
            }}>
              {/* Grid Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)",
                background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 8, fontWeight: 700,
                  color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1, padding: "10px 10px",
                  display: "flex", alignItems: "center"
                }}>Habit</div>
                {DAYS.map((day, i) => (
                  <div key={day} style={{
                    fontFamily: "'JetBrains Mono'", fontSize: 10, fontWeight: 700,
                    color: isCurrentWeek && i === todayDayIdx ? "#f59e0b" : "#71717a",
                    textAlign: "center", padding: "10px 0",
                    background: isCurrentWeek && i === todayDayIdx ? "rgba(245,158,11,0.08)" : "transparent",
                  }}>
                    {day}
                    {isCurrentWeek && i === todayDayIdx && <div style={{ width: 3, height: 3, borderRadius: 2, background: "#f59e0b", margin: "2px auto 0" }} />}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", fontSize: 12, color: "#71717a" }}>Loading...</div>
              ) : (
                HABITS.map((habit) => {
                  const hScore = getHabitScore(habit.id);
                  return (
                    <div key={habit.id} className="habit-row" style={{
                      display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      borderLeft: habit.priority ? "2px solid #f59e0b" : "2px solid transparent",
                    }}>
                      <div style={{
                        padding: "8px", display: "flex", alignItems: "center", gap: 6,
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <span style={{ fontSize: 16 }}>{habit.icon}</span>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {habit.name}
                          </div>
                          <div style={{ fontSize: 8, color: "#71717a", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{habit.sub}</div>
                        </div>
                      </div>
                      {DAYS.map((_, dayIdx) => {
                        const cellKey = `${habit.id}-${dayIdx}`; const checked = !!data[cellKey]; const isToday = isCurrentWeek && dayIdx === todayDayIdx;
                        return (
                          <div key={dayIdx} className={`check-btn ${animatingCell === cellKey ? "cell-anim" : ""}`}
                            onClick={() => toggle(habit.id, dayIdx)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: isToday ? "rgba(245,158,11,0.05)" : "transparent",
                              borderRight: dayIdx < 6 ? "1px solid rgba(255,255,255,0.03)" : "none",
                            }}
                          >
                            <div style={{
                              width: 24, height: 24, borderRadius: 6,
                              border: checked ? "none" : "1.5px solid rgba(255,255,255,0.12)",
                              background: checked ? (habit.priority ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #10b981, #059669)") : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, transition: "all 0.2s",
                              boxShadow: checked ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                            }}>{checked && "✓"}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}

              {/* Day totals */}
              <div style={{
                display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)",
                background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 8, fontWeight: 700,
                  color: "#71717a", textTransform: "uppercase", letterSpacing: 1, padding: "10px 10px", display: "flex", alignItems: "center"
                }}>Total</div>
                {DAYS.map((_, i) => {
                  const ds = getDayScore(i);
                  return (
                    <div key={i} style={{
                      textAlign: "center", padding: "10px 0", fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700,
                      color: ds === 8 ? "#f59e0b" : ds >= 6 ? "#10b981" : ds >= 4 ? "#3b82f6" : "#71717a",
                    }}>
                      {ds > 0 ? ds : "–"}{ds === 8 && <span style={{ fontSize: 8, marginLeft: 1 }}>🔥</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================= GOALS VIEW ======================= */}
        {activeTab === 'goals' && (
          <div className="fade-up-2 ar-text">
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#fff" }}>الأهداف الاستراتيجية</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#a1a1aa" }}>خطط بذكاء، نفذ بانضباط.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {GOAL_CATEGORIES.map(cat => (
                <div key={cat.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden"
                }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{cat.title}</h3>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {GOAL_PERIODS.map(period => {
                      const key = `${cat.id}-${period.id}`;
                      return (
                        <div key={period.id}>
                          <label style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 500, display: "block" }}>{period.title}</label>
                          <textarea
                            className="goal-input"
                            rows={2}
                            placeholder={`اكتب ${period.title} هنا...`}
                            value={goals[key] || ""}
                            onChange={(e) => updateGoal(cat.id, period.id, e.target.value)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= RULES VIEW ======================= */}
        {activeTab === 'rules' && (
          <div className="fade-up-3 ar-text">
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#fff" }}>قواعد الانضباط</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#a1a1aa" }}>المبادئ التي تحكم يومك وتصنع مستقبلك.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {RULES.map((rule, idx) => (
                <div key={idx} style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                  borderRadius: 16, padding: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", gap: 14, alignItems: "flex-start"
                }}>
                  <div style={{
                    background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                    width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                  }}>
                    {rule.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#e4e4e7" }}>{rule.title}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#a1a1aa", lineHeight: 1.6 }}>{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: "16px", background: "rgba(99,102,241,0.05)", borderRadius: 16, border: "1px solid rgba(99,102,241,0.15)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#818cf8", fontWeight: 700, fontStyle: "italic", lineHeight: 1.6 }}>
                "أفضل وقت لزراعة شجرة كان قبل 20 عاماً. ثاني أفضل وقت هو الآن."
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
