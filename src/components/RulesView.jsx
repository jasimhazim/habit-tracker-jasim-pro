import { useState, useEffect } from "react";
import { Shield, Award, Edit3, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function RulesView() {
  const [rules, setRules] = useState([
    { title: "قاعدة #1", desc: "النوم قبل منتصف الليل للحفاظ على الطاقة." },
  ]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("pro_token");
        const res = await fetch("/api/data/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data["rules:data"]) {
            setRules(JSON.parse(data["rules:data"]));
          }
        }
      } catch (e) {
        console.error("Failed to load rules", e);
      }
    };
    load();
  }, []);

  const saveRules = async () => {
    try {
      const token = localStorage.getItem("pro_token");
      await fetch("/api/data/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "rules:data",
          value: JSON.stringify(rules),
        }),
      });
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save rules", e);
    }
  };

  const updateRule = (index, field, value) => {
    const next = [...rules];
    next[index][field] = value;
    setRules(next);
  };

  const addRule = () => {
    setRules([...rules, { title: `قاعدة #${rules.length + 1}`, desc: "" }]);
  };

  const deleteRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="fade-up-2 ar-text">
      <div
        style={{
          marginBottom: 24,
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
            قواعد الانضباط
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#a1a1aa",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            المبادئ التي تحكم يومك وتصنع مستقبلك.
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditing) saveRules();
            else setIsEditing(true);
          }}
          style={{
            background: isEditing ? "#f59e0b" : "transparent",
            border: isEditing ? "none" : "1px solid rgba(255,255,255,0.1)",
            color: isEditing ? "#000" : "#a1a1aa",
            padding: "8px 20px",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 700,
            fontFamily: "'Tajawal', sans-serif",
            fontSize: 13,
          }}
        >
          {isEditing ? "حفظ القواعد" : "تعديل الدستور"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rules.map((rule, idx) => (
          <div
            key={idx}
            style={{
              background: isEditing
                ? "rgba(0,0,0,0.4)"
                : "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              borderRadius: 16,
              padding: "16px",
              border: isEditing
                ? "1px solid #f59e0b"
                : "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              transition: "all 0.2s",
            }}
          >
            {!isEditing && (
              <div
                style={{
                  background: "rgba(245,158,11,0.1)",
                  color: "#f59e0b",
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <Shield size={20} />
              </div>
            )}

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => updateRule(idx, "title", e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: "'Tajawal', sans-serif",
                      padding: "4px 0",
                      outline: "none",
                    }}
                  />
                  <textarea
                    value={rule.desc}
                    onChange={(e) => updateRule(idx, "desc", e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#a1a1aa",
                      fontSize: 14,
                      fontFamily: "'Tajawal', sans-serif",
                      resize: "none",
                      outline: "none",
                      lineHeight: 1.6,
                    }}
                    rows={2}
                  />
                </>
              ) : (
                <>
                  <h4
                    style={{
                      margin: "0 0 6px",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#e4e4e7",
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  >
                    {rule.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#a1a1aa",
                      lineHeight: 1.6,
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  >
                    {rule.desc}
                  </p>
                </>
              )}
            </div>

            {isEditing && (
              <button
                onClick={() => deleteRule(idx)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <button
            onClick={addRule}
            style={{
              background: "transparent",
              border: "1px dashed rgba(245,158,11,0.5)",
              color: "#f59e0b",
              padding: "16px",
              borderRadius: 16,
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(245,158,11,0.05)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Plus size={20} /> إضافة قاعدة جديدة
          </button>
        )}
      </div>

      {!isEditing && (
        <div
          style={{
            marginTop: 24,
            padding: "16px",
            background: "rgba(99,102,241,0.05)",
            borderRadius: 16,
            border: "1px solid rgba(99,102,241,0.15)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#818cf8",
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1.6,
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            "أفضل وقت لزراعة شجرة كان قبل 20 عاماً. ثاني أفضل وقت هو الآن."
          </p>
        </div>
      )}
    </div>
  );
}
