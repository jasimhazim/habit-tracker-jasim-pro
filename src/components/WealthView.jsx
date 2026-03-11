import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";

const mockSpendingData = [
  { day: '1st', amount: 120 },
  { day: '5th', amount: 300 },
  { day: '10th', amount: 200 },
  { day: '15th', amount: 500 },
  { day: '20th', amount: 250 },
  { day: '25th', amount: 400 },
];

export default function WealthView() {
  const [linkToken, setLinkToken] = useState(null);
  const [balance, setBalance] = useState("CAD 4,250.00");
  const [loading, setLoading] = useState(false);

  // In production, fetch Link Token from Express Backend
  useEffect(() => {
    // Mocking fetch to avoid crash if .env is missing
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/create_link_token', { method: 'POST' });
        const data = await res.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
        }
      } catch (err) {
        console.warn('Plaid backend not running, using mock data.');
      }
    };
    fetchToken();
  }, []);

  const onSuccess = useCallback(async (public_token, metadata) => {
    setLoading(true);
    try {
      await fetch('/api/set_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });
      // Simulate real balance fetch
      setBalance("CAD 9,540.20");
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
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#fff", fontFamily: "'Tajawal', sans-serif" }}>الثروة والنفقات</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#a1a1aa", fontFamily: "'Tajawal', sans-serif" }}>اربط حسابك البنكي وتتبع مصاريفك.</p>
      </div>

      {/* Primary Balance Card */}
      <div style={{ background: "linear-gradient(135deg, #27272a, #09090b)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 24, marginBottom: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Balance</div>
        <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'JetBrains Mono'", display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
          {balance}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button 
            onClick={() => open()} disabled={!ready && !!linkToken}
            style={{ 
              flex: 1, background: '#fff', color: '#000', border: 'none', 
              borderRadius: 12, padding: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: "'JetBrains Mono'" 
            }}>
            {linkToken ? 'Connect Bank' : 'Link Plaid'}
          </button>
        </div>
      </div>

      {/* Spending Chart */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", padding: "16px 16px 0", height: 220, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Monthly Spend</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', fontFamily: "'JetBrains Mono'", marginBottom: 8 }}>CAD 1,770.00</div>
        <ResponsiveContainer width="100%" height="60%">
          <AreaChart data={mockSpendingData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ background: 'rgba(9,9,11,0.9)', border: '1px solid #27272a', borderRadius: 8, color: '#fff' }}
              itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
              formatter={(val) => `CAD ${val}`}
            />
            <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="ar-text" style={{ fontSize: 13, color: '#71717a', textAlign: 'center', padding: '0 20px' }}>
        * يتم استخدام بيئة Plaid Sandbox الآمنة. لم يتم ربط حسابات حقيقية لحين إضافة مفاتيح الإنتاج (Production Keys).
      </div>
    </div>
  );
}
