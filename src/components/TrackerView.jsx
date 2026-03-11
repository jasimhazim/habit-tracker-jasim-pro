import { useState, useEffect, useCallback } from "react";
import { HABITS as DEFAULT_HABITS, DAYS } from "../utils/constants";
import { getWeekKey, getWeekLabel, getTodayDayIdx } from "../utils/date";
import { Settings2, Plus, X, Trash2 } from "lucide-react";

export default function TrackerView({ updateStreak }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState({});
  const [userHabits, setUserHabits] = useState(DEFAULT_HABITS);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [animatingCell, setAnimatingCell] = useState(null);
  
  // Modal States
  const [isEditHabitsOpen, setIsEditHabitsOpen] = useState(false);
  const [editingHabits, setEditingHabits] = useState([]);

  const weekKey = getWeekKey(weekOffset);
  const storageKey = `tracker:${weekKey}`;

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("pro_token");
        
        // Fetch Settings for Custom Habits
        const setRes = await fetch("/api/data/settings", { headers: { Authorization: `Bearer ${token}` } });
        if (setRes.ok) {
          const sData = await setRes.json();
          if (sData['tracker:habits']) {
            setUserHabits(JSON.parse(sData['tracker:habits']));
          }
        }

        // Fetch Tracked Data
        const res = await fetch("/api/data/habits", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error("Failed to load habits", e);
      }
      setLoading(false);
    };
    load();
  }, []); // Only load once, then use local state

  // Compute streak (mocked for now, just based on total current completions)
  useEffect(() => {
    const total = Object.values(data).filter(Boolean).length;
    let s = 0;
    if (total > 2) s = 1;
    if (total > 10) s = 2;
    if (total > 20) s = 3;
    setStreak(s);
    if (updateStreak) updateStreak(s);
  }, [data, updateStreak]);

  const toggle = useCallback(
    async (habitId, dayIdx) => {
      // Determine exact key based on current week offset and day
      const key = `w${weekOffset}-${habitId}-${dayIdx}`;

      setAnimatingCell(key);
      setTimeout(() => setAnimatingCell(null), 300);

      const nextVal = !data[key];
      setData((prev) => ({ ...prev, [key]: nextVal }));

      try {
        const token = localStorage.getItem("pro_token");
        await fetch("/api/data/habits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key, completed: nextVal }),
        });
      } catch (e) {
        console.error(e);
        // Revert on failure
        setData((prev) => ({ ...prev, [key]: !nextVal }));
      }
    },
    [data, weekOffset],
  );

  const saveHabits = async () => {
    try {
      const token = localStorage.getItem("pro_token");
      await fetch("/api/data/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ key: 'tracker:habits', value: JSON.stringify(editingHabits) }),
      });
      setUserHabits(editingHabits);
      setIsEditHabitsOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openHabitsModal = () => {
    setEditingHabits([...userHabits]);
    setIsEditHabitsOpen(true);
  };

  const totalChecked = Object.values(data).filter(Boolean).length;
  const maxScore = userHabits.length * 7;
  // Calculate PCT based purely on this week's visible data
  const weeklyChecked = userHabits.reduce((acc, h) => {
    return (
      acc +
      DAYS.reduce(
        (sum, _, i) => sum + (data[`w${weekOffset}-${h.id}-${i}`] ? 1 : 0),
        0,
      )
    );
  }, 0);
  const pct = Math.round((weeklyChecked / maxScore) * 100);

  const todayDayIdx = getTodayDayIdx();
  const isCurrentWeek = weekOffset === 0;

  const getHabitScore = (habitId) =>
    DAYS.reduce(
      (sum, _, i) => sum + (data[`w${weekOffset}-${habitId}-${i}`] ? 1 : 0),
      0,
    );
  const getDayScore = (dayIdx) =>
    userHabits.reduce(
      (sum, h) => sum + (data[`w${weekOffset}-${h.id}-${dayIdx}`] ? 1 : 0),
      0,
    );

  return (
    <main className="fade-up-1">
      {/* Week Nav */}
      <nav
        aria-label="Week Navigation"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <button
          className="nav-btn"
          aria-label="Previous week"
          onClick={() => setWeekOffset((p) => p - 1)}
        >
          &lt;
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {getWeekLabel(weekKey)}
            {isCurrentWeek && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 9,
                  color: "#10b981",
                  background: "rgba(16,185,129,0.15)",
                  padding: "2px 6px",
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                NOW
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={openHabitsModal}
            className="nav-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '6px 12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}
          >
            <Settings2 size={16} /> العادات
          </button>
          <button
            className="nav-btn"
            aria-label="Next week"
            onClick={() => setWeekOffset((p) => Math.min(p + 1, 0))}
          >
            &gt;
          </button>
        </div>
      </nav>

      {/* Progress */}
      <div
        role="progressbar"
        aria-valuenow={weeklyChecked}
        aria-valuemax={maxScore}
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 10,
                width: `${pct}%`,
                background:
                  pct >= 89
                    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                    : pct >= 71
                      ? "linear-gradient(90deg, #10b981, #059669)"
                      : pct >= 50
                        ? "#3b82f6"
                        : "#71717a",
                transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 18,
            fontWeight: 900,
            minWidth: 60,
            textAlign: "right",
            letterSpacing: -0.5,
          }}
        >
          {weeklyChecked}
          <span style={{ fontSize: 11, fontWeight: 500, color: "#71717a" }}>
            /{maxScore}
          </span>
        </div>
      </div>

      {/* GRID */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {/* Grid Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px repeat(7, 1fr)",
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 8,
              fontWeight: 700,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "10px 10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Habit
          </div>
          {DAYS.map((day, i) => (
            <div
              key={day}
              style={{
                fontFamily: "'JetBrains Mono'",
                fontSize: 10,
                fontWeight: 700,
                color:
                  isCurrentWeek && i === todayDayIdx ? "#f59e0b" : "#71717a",
                textAlign: "center",
                padding: "10px 0",
                background:
                  isCurrentWeek && i === todayDayIdx
                    ? "rgba(245,158,11,0.08)"
                    : "transparent",
              }}
            >
              {day}
              {isCurrentWeek && i === todayDayIdx && (
                <div
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 2,
                    background: "#f59e0b",
                    margin: "2px auto 0",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              fontSize: 12,
              color: "#71717a",
            }}
          >
            Loading...
          </div>
        ) : (
          userHabits.map((habit) => {
            const hScore = getHabitScore(habit.id);
            return (
              <div
                key={habit.id}
                className="habit-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px repeat(7, 1fr)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: habit.priority
                    ? "2px solid #f59e0b"
                    : "2px solid transparent",
                }}
              >
                <div
                  style={{
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{habit.icon}</span>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {habit.name}
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: "#71717a",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {habit.sub}
                    </div>
                  </div>
                </div>
                {DAYS.map((_, dayIdx) => {
                  const cellKey = `${habit.id}-${dayIdx}`;
                  const checked = !!data[cellKey];
                  const isToday = isCurrentWeek && dayIdx === todayDayIdx;
                  return (
                    <button
                      key={dayIdx}
                      className={`check-btn ${animatingCell === cellKey ? "cell-anim" : ""}`}
                      aria-label={`Toggle ${habit.name} for ${DAYS[dayIdx]}`}
                      aria-checked={checked}
                      role="switch"
                      onClick={() => toggle(habit.id, dayIdx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isToday
                          ? "rgba(245,158,11,0.05)"
                          : "transparent",
                        borderRight:
                          dayIdx < 6
                            ? "1px solid rgba(255,255,255,0.03)"
                            : "none",
                        borderTop: "none",
                        borderLeft: "none",
                        borderBottom: "none",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          border: checked
                            ? "none"
                            : "1.5px solid rgba(255,255,255,0.12)",
                          background: checked
                            ? habit.priority
                              ? "linear-gradient(135deg, #f59e0b, #d97706)"
                              : "linear-gradient(135deg, #10b981, #059669)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          transition: "all 0.2s",
                          boxShadow: checked
                            ? "0 2px 8px rgba(0,0,0,0.3)"
                            : "none",
                        }}
                      >
                        {checked && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}

        {/* Day totals */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px repeat(7, 1fr)",
            background: "rgba(255,255,255,0.04)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 8,
              fontWeight: 700,
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "10px 10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Total
          </div>
          {DAYS.map((_, i) => {
            const ds = getDayScore(i);
            return (
              <div
                key={i}
                className={ds === 8 ? "day-perfect" : ""}
                style={{
                  textAlign: "center",
                  padding: "10px 0",
                  fontFamily: "'JetBrains Mono'",
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    ds === 8
                      ? "#f59e0b"
                      : ds >= 6
                        ? "#10b981"
                        : ds >= 4
                          ? "#3b82f6"
                          : "#71717a",
                }}
              >
                {ds > 0 ? ds : "–"}
                {ds === 8 && (
                  <span style={{ fontSize: 8, marginLeft: 1 }}>🔥</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Widget */}
      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.02) 100%)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 16,
          padding: "16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 24 }}>💡</div>
        <div>
          <h4
            style={{
              margin: "0 0 4px",
              fontSize: 13,
              color: "#f59e0b",
              fontFamily: "'JetBrains Mono'",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Daily Intel
          </h4>
          <p
            className="ar-text"
            style={{
              margin: 0,
              fontSize: 14,
              color: "#e4e4e7",
              lineHeight: 1.5,
            }}
          >
            {pct > 80
              ? "أداء مبهر هذا الأسبوع. واصل بنفس الوتيرة ولا تتوقف."
              : pct > 50
                ? "أنت في منتصف الطريق. تذكر أهدافك وقاتل من أجلها اليوم."
                : "بداية بطيئة، ولكن اليوم هو فرصتك لتعويض كل شيء. انهض!"}
          </p>
        </div>
      </div>

      {/* Edit Custom Habits Modal */}
      {isEditHabitsOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setIsEditHabitsOpen(false)}>
          <div style={{
            background: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, maxHeight: '85vh',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)', cursor: 'default',
            display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#fff', fontFamily: "'Tajawal', sans-serif" }}>
                تخصيص العادات اليومية
              </h3>
              <button onClick={() => setIsEditHabitsOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a1a1aa', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', paddingRight: 8, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editingHabits.map((h, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={h.icon}
                    onChange={(e) => {
                      const next = [...editingHabits];
                      next[idx].icon = e.target.value;
                      setEditingHabits(next);
                    }}
                    style={{ width: 44, height: 44, fontSize: 20, textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text" value={h.name} placeholder="اسم العادة"
                      onChange={(e) => {
                        const next = [...editingHabits];
                        next[idx].name = e.target.value;
                        setEditingHabits(next);
                      }}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 15, fontWeight: 700, outline: 'none', fontFamily: "'Tajawal', sans-serif", paddingBottom: 4 }}
                    />
                    <input
                      type="text" value={h.sub} placeholder="الوصف القصير"
                      onChange={(e) => {
                        const next = [...editingHabits];
                        next[idx].sub = e.target.value;
                        setEditingHabits(next);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: 13, outline: 'none', fontFamily: "'Tajawal', sans-serif" }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const next = [...editingHabits];
                      next[idx].priority = !next[idx].priority;
                      setEditingHabits(next);
                    }}
                    style={{
                      background: h.priority ? 'rgba(245,158,11,0.1)' : 'transparent',
                      border: h.priority ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      color: h.priority ? '#f59e0b' : '#71717a',
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Tajawal', sans-serif"
                    }}
                  >
                    أولوية
                  </button>
                  <button
                    onClick={() => {
                      setEditingHabits(editingHabits.filter((_, i) => i !== idx));
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8 }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditingHabits([...editingHabits, { id: `h${Date.now()}`, icon: '🎯', name: 'عادة جديدة', sub: 'وصف قصير', priority: false }])}
                style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', color: '#a1a1aa', padding: 16, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}
              >
                <Plus size={18} /> إضافة عادة
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => setIsEditHabitsOpen(false)} style={{ background: 'transparent', color: '#a1a1aa', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>
                إلغاء
              </button>
              <button onClick={saveHabits} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontFamily: "'Tajawal', sans-serif", boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
