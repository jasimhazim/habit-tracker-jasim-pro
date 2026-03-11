import { useState, useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";

const mockSpendingData = [
  { day: "1st", amount: 120 },
  { day: "5th", amount: 300 },
  { day: "10th", amount: 200 },
  { day: "15th", amount: 500 },
  { day: "20th", amount: 250 },
  { day: "25th", amount: 400 },
];

export default function WealthView() {
  const [linkToken, setLinkToken] = useState(null);
  const [finData, setFinData] = useState({
    balance: "4250.00",
    budget: "2000.00",
  });
  const [isEditingWealth, setIsEditingWealth] = useState(false);
  const [loading, setLoading] = useState(false);

  // In production, fetch Link Token from Express Backend
  useEffect(() => {
    // Mocking fetch to avoid crash if .env is missing
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/create_link_token", { method: "POST" });
        const data = await res.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
        }
      } catch (err) {
        console.warn("Plaid backend not running, using mock data.");
      }
      try {
        const token = localStorage.getItem("pro_token");
        const sRes = await fetch("/api/data/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData["wealth:data"])
            setFinData(JSON.parse(sData["wealth:data"]));
        }
      } catch (e) {}
    };
    fetchToken();
  }, []);

  const saveWealth = async () => {
    try {
      const token = localStorage.getItem("pro_token");
      await fetch("/api/data/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "wealth:data",
          value: JSON.stringify(finData),
        }),
      });
      setIsEditingWealth(false);
    } catch (e) {
      console.error("Failed to save wealth", e);
    }
  };

  const onSuccess = useCallback(async (public_token, metadata) => {
    setLoading(true);
    try {
      await fetch("/api/set_access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });
      // Simulate real balance fetch
      setFinData((prev) => ({ ...prev, balance: "9540.20" }));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <div className="fade-up-1">
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 4px",
            color: "#fff",
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          الثروة والنفقات
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#a1a1aa",
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          اربط حسابك البنكي وتتبع مصاريفك.
        </p>
      </div>

      {/* Primary Balance Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #27272a, #09090b)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 24,
          marginBottom: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#a1a1aa",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Total Balance
            </div>
            {isEditingWealth ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    color: "#a1a1aa",
                    fontSize: 18,
                    fontFamily: "'JetBrains Mono'",
                  }}
                >
                  CAD
                </span>
                <input
                  type="number"
                  value={finData.balance}
                  onChange={(e) =>
                    setFinData({ ...finData, balance: e.target.value })
                  }
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid #f59e0b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#fff",
                    fontSize: 20,
                    outline: "none",
                    fontFamily: "'JetBrains Mono'",
                    width: 150,
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono'",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#fff",
                }}
              >
                CAD{" "}
                {parseFloat(finData.balance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (isEditingWealth) saveWealth();
              else setIsEditingWealth(true);
            }}
            style={{
              background: isEditingWealth ? "#f59e0b" : "transparent",
              border: isEditingWealth
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
              color: isEditingWealth ? "#000" : "#a1a1aa",
              padding: "6px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
              fontSize: 12,
            }}
          >
            {isEditingWealth ? "حفظ البيانات" : "تعديل الرصيد"}
          </button>
        </div>
        {!isEditingWealth && (
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={() => open()}
              disabled={!ready && !!linkToken}
              style={{
                flex: 1,
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: 12,
                padding: "12px",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono'",
              }}
            >
              {linkToken ? "Connect Bank" : "Link Plaid"}
            </button>
          </div>
        )}
      </div>

      {/* Spending Target & Chart */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 16px 0",
          height: 260,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#a1a1aa",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Monthly Target Budget
            </div>
            {isEditingWealth ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    color: "#a1a1aa",
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono'",
                  }}
                >
                  CAD
                </span>
                <input
                  type="number"
                  value={finData.budget}
                  onChange={(e) =>
                    setFinData({ ...finData, budget: e.target.value })
                  }
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    color: "#fff",
                    fontSize: 16,
                    outline: "none",
                    fontFamily: "'JetBrains Mono'",
                    width: 120,
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#f59e0b",
                  fontFamily: "'JetBrains Mono'",
                  marginBottom: 8,
                }}
              >
                CAD{" "}
                {parseFloat(finData.budget).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer
          width="100%"
          height="60%"
          style={{ marginTop: 16 }}
        >
          <AreaChart
            data={mockSpendingData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "rgba(9,9,11,0.9)",
                border: "1px solid #27272a",
                borderRadius: 8,
                color: "#fff",
              }}
              itemStyle={{ color: "#f59e0b", fontWeight: "bold" }}
              formatter={(val) => `CAD ${val}`}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#f59e0b"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        className="ar-text"
        style={{
          fontSize: 13,
          color: "#71717a",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        * يتم استخدام بيئة Plaid Sandbox الآمنة. لم يتم ربط حسابات حقيقية لحين
        إضافة مفاتيح الإنتاج (Production Keys).
      </div>
    </div>
  );
}
