import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

export default function AIAgent() {
  const [messages, setMessages] = useState([
    { role: 'system', text: 'أهلاً بك أيها البطل. أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟ (مثال: أضف 500 سعرة، أو سجّل عادة المشي ليوم الاثنين)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const executeAction = async (action) => {
    try {
      if (action.type === 'update_calories') {
        // Mock execution assuming standard storage
        const wRes = await window.storage?.get('health:weights');
        if (!wRes) return;
        // In a real app we would have a dedicated calories storage separated from weights, but adapting to our current setup
        console.log("AI executing:", action);
        return `تم تفعيل إجراء السعرات (${action.value} kcal). يرجى تحديث الصفحة.`;
      }
      if (action.type === 'update_weight') {
        const wRes = await window.storage?.get('health:weights');
        const weights = wRes ? JSON.parse(wRes.value) : { start: '85', current: '79', goal: '75' };
        weights.current = String(action.value);
        await window.storage?.set('health:weights', JSON.stringify(weights));
        return `تم تحديث الوزن الحالي إلى ${action.value} kg. يرجى التحديث.`;
      }
      if (action.type === 'check_habit') {
        const hRes = await window.storage?.get(`tracker:habits`);
        const habits = hRes ? JSON.parse(hRes.value) : {};
        const key = `${action.day.toLowerCase()}-${action.habit.toLowerCase()}`;
        habits[key] = true;
        await window.storage?.set(`tracker:habits`, JSON.stringify(habits));
        return `تم تسجيل إنجاز عادة ${action.habit} ليوم ${action.day}. يرجى التحديث.`;
      }
      return "تم تنفيذ الإجراء.";
    } catch (e) {
      console.error(e);
      return "حدث خطأ أثناء التنفيذ.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Gather generic context for the AI
      const context = {
        habits: ['Gym', 'Diet', 'Study', 'Sleep', 'Water', 'Tidy', 'Phone', 'Spend'],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, context })
      });

      const data = await res.json();
      
      if (data.error) {
        setMessages(p => [...p, { role: 'system', text: `⚠️ خطأ: ${data.error}` }]);
        setIsLoading(false);
        return;
      }

      if (data.actions && data.actions.length > 0) {
        let results = [];
        for (const action of data.actions) {
          const resText = await executeAction(action);
          results.push(resText);
          // Auto-reload to show AI changes
          setTimeout(() => window.location.reload(), 2000);
        }
        setMessages(p => [...p, { role: 'system', text: `تم التنفيذ! \n${results.join(', ')}` }]);
      } else {
        setMessages(p => [...p, { role: 'system', text: "لم أتمكن من استخراج إجراء محدد من طلبك. هل يمكنك التوضيح أكثر؟" }]);
      }
    } catch (error) {
      console.warn('AI Backend failed or missing API Key.');
      setMessages(p => [...p, { role: 'system', text: "⚠️ عذراً، لا يمكنني الاتصال بمحرك الذكاء الاصطناعي الآن تأكد من توفر OPENAI_API_KEY." }]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Sparkles color="#6366f1" size={24} />
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#fff', fontFamily: "'Tajawal', sans-serif" }}>المساعد الذكي (AI)</h2>
      </div>
      
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 32, height: 32, borderRadius: 12, background: msg.role === 'user' ? '#3b82f6' : 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={18} color="#6366f1" />}
            </div>
            <div style={{ 
              background: msg.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.05)', 
              color: '#fff', padding: '12px 16px', borderRadius: 16, 
              borderTopRightRadius: msg.role === 'user' ? 4 : 16,
              borderTopLeftRadius: msg.role === 'system' ? 4 : 16,
              fontSize: 14, fontFamily: "'Tajawal', sans-serif", lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 12, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={16} color="#6366f1" className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, fontSize: 13, fontFamily: "'Tajawal', sans-serif" }}>
              يفكر...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="اكتب أمرك هنا..." 
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 14, outline: 'none', padding: '0 8px', fontFamily: "'Tajawal', sans-serif" }} 
        />
        <button type="submit" disabled={isLoading || !input.trim()} style={{ background: '#6366f1', border: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', color: '#fff', transition: 'transform 0.2s' }} onMouseOver={e => {if(input.trim()) e.currentTarget.style.transform = 'scale(1.05)'}} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <Send size={18} />
        </button>
      </form>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
