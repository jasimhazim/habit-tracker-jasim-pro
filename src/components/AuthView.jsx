import { useState } from 'react';
import { Sparkles, Mail, Lock, User, UploadCloud, ChevronRight, Loader2 } from 'lucide-react';

export default function AuthView({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password } 
      : { email, password, displayName: name, profilePictureUrl: profilePic };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      // Save token and user data securely
      localStorage.setItem('pro_token', data.token);
      localStorage.setItem('pro_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ar-text" style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(99,102,241,0.15) 0%, #09090b 50%, #000000 100%)',
      padding: 20
    }}>
      <div className="fade-up" style={{
        width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)', borderRadius: 32, padding: 40,
        border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative ambient light */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 200, height: 200, background: '#6366f1', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(99,102,241,0.5)' }}>
            <Sparkles color="#fff" size={32} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 8px', fontFamily: "'Tajawal', sans-serif" }}>
            {isLogin ? 'مرحباً بعودتك' : 'انضم إلى النخبة'}
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: 16, margin: 0 }}>
            {isLogin ? 'قم بتسجيل الدخول للوصول إلى لوحة القيادة الذكية.' : 'أنشئ حسابك لتجربة قوة المساعد الذكي.'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 14, marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div className="fade-up" style={{ position: 'relative' }}>
              <User color="#71717a" size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="الاسم الكامل" required value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 48px 16px 16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'Tajawal', sans-serif" }}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail color="#71717a" size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email" placeholder="البريد الإلكتروني" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 48px 16px 16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'JetBrains Mono', sans-serif" }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock color="#71717a" size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" placeholder="كلمة المرور" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 48px 16px 16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'JetBrains Mono', sans-serif" }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {!isLogin && (
            <div className="fade-up" style={{ position: 'relative' }}>
              <UploadCloud color="#71717a" size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="url" placeholder="رابط الصورة الشخصية (اختياري)" value={profilePic} onChange={e => setProfilePic(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 48px 16px 16px', color: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'JetBrains Mono', sans-serif" }}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}

          <button type="submit" disabled={loading} style={{ 
            width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: 16, 
            padding: 16, fontSize: 16, fontWeight: 900, fontFamily: "'Tajawal', sans-serif", 
            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 8, transition: 'transform 0.2s, background 0.2s'
          }} onMouseOver={e => !loading && (e.currentTarget.style.transform = 'scale(1.02)')} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            {loading ? <Loader2 size={24} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب برو')}
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: 32 }}>
          <p style={{ color: '#71717a', fontSize: 14 }}>
            {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 800, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", fontSize: 14, padding: 0 }}>
              {isLogin ? 'أنشئ حساباً الآن' : 'سجل دخولك'}
            </button>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
