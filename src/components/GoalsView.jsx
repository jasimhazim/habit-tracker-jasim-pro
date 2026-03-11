import { useState, useEffect, useCallback } from "react";
import { GOAL_CATEGORIES, GOAL_PERIODS } from "../utils/constants";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "W1", value: 20 },
  { name: "W2", value: 45 },
  { name: "W3", value: 60 },
  { name: "W4", value: 85 },
];

export default function GoalsView() {
  const [goals, setGoals] = useState({});
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const goalsKey = `goals:data`;

  useEffect(() => {
    const load = async () => {
      try {
        const gRes = await window.storage?.get(goalsKey);
        setGoals(gRes ? JSON.parse(gRes.value) : {});
      } catch {
        setGoals({});
      }
    };
    load();
  }, [goalsKey]);

  const updateGoal = useCallback(
    async (catId, periodId, val) => {
      const next = { ...goals, [`${catId}-${periodId}`]: val };
      setGoals(next);
      try {
        await window.storage?.set(goalsKey, JSON.stringify(next));
      } catch (e) {}
    },
    [goals, goalsKey],
  );

  return (
    <div className="fade-up-2 ar-text">
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              margin: "0 0 4px",
              color: "#fff",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            الأهداف الاستراتيجية
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#a1a1aa",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            خطط بذكاء، نفذ بانضباط.
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditingGoals) {
              // save happens automatically on change currently, but we can just toggle the view
              setIsEditingGoals(false);
            } else {
              setIsEditingGoals(true);
            }
          }}
          style={{
            background: isEditingGoals ? "#8b5cf6" : "transparent",
            border: isEditingGoals ? "none" : "1px solid rgba(255,255,255,0.1)",
            color: isEditingGoals ? "#fff" : "#a1a1aa",
            padding: "8px 20px",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 700,
            fontFamily: "'Tajawal', sans-serif",
            fontSize: 13,
          }}
        >
          {isEditingGoals ? "حفظ الأهداف" : "صياغة الأهداف"}
        </button>
      </div>

      {/* Mini Progress Chart */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "16px",
          marginBottom: 20,
          height: 180,
          position: "relative",
          direction: "ltr", // charts look better LTR
        }}
      >
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
          <div
            style={{
              fontSize: 12,
              color: "#a1a1aa",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Q1 Progress
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'JetBrains Mono'",
            }}
          >
            85%
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "rgba(9,9,11,0.9)",
                border: "1px solid #27272a",
                borderRadius: 8,
                color: "#fff",
              }}
              itemStyle={{ color: "#8b5cf6", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {GOAL_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {cat.title}
              </h3>
            </div>
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {GOAL_PERIODS.map((period) => {
                const key = `${cat.id}-${period.id}`;
                const text = goals[key] || "";
                return (
                  <div key={period.id}>
                    <label
                      style={{
                        fontSize: 12,
                        color: "#a1a1aa",
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {period.title}
                    </label>
                    {isEditingGoals ? (
                      <textarea
                        style={{
                          width: "100%",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid #8b5cf6",
                          color: "#fff",
                          fontFamily: "'Tajawal', sans-serif",
                          fontSize: 14,
                          padding: "12px",
                          borderRadius: 12,
                          outline: "none",
                          resize: "none",
                          direction: "rtl",
                          lineHeight: 1.6,
                          boxSizing: "border-box",
                        }}
                        rows={2}
                        placeholder={`اكتب ${period.title} هنا...`}
                        value={text}
                        onChange={(e) =>
                          updateGoal(cat.id, period.id, e.target.value)
                        }
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 15,
                          color: text ? "#fff" : "#52525b",
                          lineHeight: 1.6,
                          background: "rgba(255,255,255,0.01)",
                          padding: "12px",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.02)",
                        }}
                      >
                        {text || "لم يتم تحديد رؤية لهذا المسار بعد."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
