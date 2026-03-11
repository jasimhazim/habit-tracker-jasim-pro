import { useState, useEffect, useCallback } from "react";
import { HABITS, DAYS } from "../utils/constants";
import { getWeekKey, getWeekLabel, getTodayDayIdx } from "../utils/date";

export default function TrackerView({ updateStreak }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [animatingCell, setAnimatingCell] = useState(null);

  const weekKey = getWeekKey(weekOffset);
  const storageKey = `tracker:${weekKey}`;

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await window.storage?.get(storageKey);
        setData(res ? JSON.parse(res.value) : {});
      } catch { setData({}); }
      setLoading(false);
    };
    load();
  }, [storageKey]);

  // Compute streak
  useEffect(() => {
    const computeStreak = async () => {
      let s = 0;
      for (let i = 0; i >= -52; i--) {
        const wk = getWeekKey(i);
        const key = `tracker:${wk}`;
        try {
          const res = await window.storage?.get(key);
          if (res) {
            const d = JSON.parse(res.value);
            const total = Object.values(d).filter(Boolean).length;
            if (total >= 40) s++;
            else if (i < 0) break;
          } else if (i < 0) break;
        } catch { if (i < 0) break; }
      }
      setStreak(s);
      if (updateStreak) updateStreak(s);
    };
    computeStreak();
  }, [data, weekOffset, updateStreak]);

  const toggle = useCallback(async (habitId, dayIdx) => {
    const key = `${habitId}-${dayIdx}`;
    setAnimatingCell(key);
    setTimeout(() => setAnimatingCell(null), 300);
    const next = { ...data, [key]: !data[key] };
    setData(next);
    try { await window.storage?.set(storageKey, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, [data, storageKey]);

  const totalChecked = Object.values(data).filter(Boolean).length;
  const maxScore = HABITS.length * 7;
  const pct = Math.round((totalChecked / maxScore) * 100);

  const todayDayIdx = getTodayDayIdx();
  const isCurrentWeek = weekOffset === 0;

  const getHabitScore = (habitId) => DAYS.reduce((sum, _, i) => sum + (data[`${habitId}-${i}`] ? 1 : 0), 0);
  const getDayScore = (dayIdx) => HABITS.reduce((sum, h) => sum + (data[`${h.id}-${dayIdx}`] ? 1 : 0), 0);

  return (
    <div className="fade-up-1">
      {/* Week Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="nav-btn" onClick={() => setWeekOffset((p) => p - 1)}>
          &lt;
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {getWeekLabel(weekKey)}
            {isCurrentWeek && <span style={{ marginLeft: 6, fontSize: 9, color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: 8, fontWeight: 700 }}>NOW</span>}
          </div>
        </div>
        <button className="nav-btn" onClick={() => setWeekOffset((p) => Math.min(p + 1, 0))}>
          &gt;
        </button>
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
        marginBottom: 20
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
      
      {/* Motivational Widget */}
      <div style={{
        background: "linear-gradient(145deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.02) 100%)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 16,
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }}>
        <div style={{ fontSize: 24 }}>💡</div>
        <div>
          <h4 style={{ margin: "0 0 4px", fontSize: 13, color: "#f59e0b", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", fontWeight: 700 }}>Daily Intel</h4>
          <p className="ar-text" style={{ margin: 0, fontSize: 14, color: "#e4e4e7", lineHeight: 1.5 }}>
            {pct > 80 ? "أداء مبهر هذا الأسبوع. واصل بنفس الوتيرة ولا تتوقف." : 
             pct > 50 ? "أنت في منتصف الطريق. تذكر أهدافك وقاتل من أجلها اليوم." : 
             "بداية بطيئة، ولكن اليوم هو فرصتك لتعويض كل شيء. انهض!"}
          </p>
        </div>
      </div>
    </div>
  );
}
