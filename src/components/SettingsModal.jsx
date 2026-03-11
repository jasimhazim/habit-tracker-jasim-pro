import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Save, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const [weights, setWeights] = useState({ start: "85", current: "79.8", goal: "75" });
  const [goals, setGoals] = useState({ 
    "health-yearly": "", "health-monthly": "",
    "fin-yearly": "", "fin-monthly": "",
    "edu-yearly": "", "edu-monthly": ""
  });
  const [budget, setBudget] = useState(2000);
  const [studyHours, setStudyHours] = useState(40);

  useEffect(() => {
    const load = async () => {
      try {
        const wRes = await window.storage?.get(`health:weights`);
        if (wRes) setWeights(JSON.parse(wRes.value));
        const gRes = await window.storage?.get(`goals:data`);
        if (gRes) setGoals(JSON.parse(gRes.value));
        const bRes = await window.storage?.get(`settings:budget`);
        if (bRes) setBudget(Number(bRes.value));
        const sRes = await window.storage?.get(`settings:study`);
        if (sRes) setStudyHours(Number(sRes.value));
      } catch {}
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      await window.storage?.set(`health:weights`, JSON.stringify(weights));
      await window.storage?.set(`goals:data`, JSON.stringify(goals));
      await window.storage?.set(`settings:budget`, budget.toString());
      await window.storage?.set(`settings:study`, studyHours.toString());
      // Reload page to reflect settings everywhere easily
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const InputRow = ({ label, type = "text", value, onChange, unit }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <label style={{ color: '#e4e4e7', fontSize: 14, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>{label}</label>
      <div style={{ position: 'relative', width: '50%' }}>
        <input 
          type={type} 
          value={value || ''} 
          onChange={onChange}
          style={{ 
            width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: "'JetBrains Mono'", outline: 'none'
          }}
        />
        {unit && <span style={{ position: 'absolute', right: 12, top: 10, color: '#71717a', fontSize: 12, fontFamily: "'JetBrains Mono'" }}>{unit}</span>}
      </div>
    </div>
  );

  const GoalTextArea = ({ label, value, onChange }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: '#e4e4e7', fontSize: 14, fontWeight: 700, fontFamily: "'Tajawal', sans-serif', display: 'block", marginBottom: 8 }}>{label}</label>
      <textarea 
        value={value || ''} 
        onChange={onChange}
        style={{ 
          width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, fontFamily: "'Tajawal', sans-serif", outline: 'none', resize: 'vertical', minHeight: 80
        }}
      />
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="fade-up ar-text" style={{
        background: '#18181b', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
        width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#18181b', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SettingsIcon color="#f59e0b" size={24} />
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#fff', fontFamily: "'Tajawal', sans-serif" }}>الإعدادات المركزية</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ padding: 32, flex: 1 }}>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, color: '#f59e0b', margin: '0 0 16px', borderBottom: '1px solid rgba(245,158,11,0.2)', paddingBottom: 8 }}>المقاييس الصحية (Weight)</h3>
            <InputRow label="وزن البداية" type="number" value={weights.start} onChange={e => setWeights({...weights, start: e.target.value})} unit="kg" />
            <InputRow label="الوزن الحالي" type="number" value={weights.current} onChange={e => setWeights({...weights, current: e.target.value})} unit="kg" />
            <InputRow label="الوزن المستهدف" type="number" value={weights.goal} onChange={e => setWeights({...weights, goal: e.target.value})} unit="kg" />
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, color: '#10b981', margin: '0 0 16px', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: 8 }}>المقاييس المالية والتعليمية</h3>
            <InputRow label="الميزانية الشهرية" type="number" value={budget} onChange={e => setBudget(e.target.value)} unit="$" />
            <InputRow label="هدف ساعات الدراسة" type="number" value={studyHours} onChange={e => setStudyHours(e.target.value)} unit="hrs" />
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, color: '#3b82f6', margin: '0 0 16px', borderBottom: '1px solid rgba(59,130,246,0.2)', paddingBottom: 8 }}>النوايا الشهرية</h3>
            <GoalTextArea label="هدف الصحة الشهري" value={goals["health-monthly"]} onChange={e => setGoals({...goals, "health-monthly": e.target.value})} />
            <GoalTextArea label="هدف الثروة الشهري" value={goals["fin-monthly"]} onChange={e => setGoals({...goals, "fin-monthly": e.target.value})} />
            <GoalTextArea label="هدف التعليم الشهري" value={goals["edu-monthly"]} onChange={e => setGoals({...goals, "edu-monthly": e.target.value})} />
          </div>
        </div>

        <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, background: '#18181b', zIndex: 10 }}>
          <button onClick={onClose} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #3f3f46', color: '#e4e4e7', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>إلغاء</button>
          <button onClick={handleSave} style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>
            <Save size={18} /> حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}
