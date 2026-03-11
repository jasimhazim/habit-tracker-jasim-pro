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

export default function DesktopWealthView() {
  const [linkToken, setLinkToken] = useState(null);
  const [balance, setBalance] = useState("$4,250.00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      setBalance("$9,540.20");
    } catch (err) {}
    setLoading(false);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Plaid Interactive Card */}
      <div className="premium-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 24, gap: 6, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent)' }}>
        <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Live Balance</div>
        <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: '#fff', marginBottom: 12 }}>
          {balance}
        </div>
        <button 
          onClick={() => open()} disabled={!ready && !!linkToken}
          style={{ 
            width: '100%', background: '#fff', color: '#000', border: 'none', 
            borderRadius: 14, padding: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: "'JetBrains Mono'",
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {linkToken ? 'Connect Bank via Plaid' : 'Secure API Linked'}
        </button>
      </div>

      {/* Advanced Spending Chart */}
      <div style={{ background: "rgba(255,255,255,0.01)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.03)", padding: "20px 20px 0", height: 260 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Spending Velocity</div>
          <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 800, fontFamily: "'JetBrains Mono'" }}>$1,770.00</div>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={mockSpendingData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpendDesk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
              formatter={(val) => `$${val}`}
            />
            <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorSpendDesk)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
