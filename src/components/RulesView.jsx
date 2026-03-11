import { RULES } from "../utils/constants";

export default function RulesView() {
  return (
    <div className="fade-up-2 ar-text">
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
  );
}
