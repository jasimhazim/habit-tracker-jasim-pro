import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      try { await window.storage?.set("tracker:auth", "true"); } catch (e) {}
      onLogin();
    } else {
      setLoginError("يرجى إدخال اسم المستخدم وكلمة المرور");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#09090b", color: "#f4f4f5",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <style>{`
        .login-input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #fff; font-family: 'Tajawal', sans-serif; font-size: 15px; padding: 14px 16px;
          border-radius: 12px; outline: none; margin-bottom: 16px; direction: rtl;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .login-input:focus { border-color: #f59e0b; background: rgba(245,158,11,0.05); }
        .login-btn {
          width: 100%; background: #f59e0b; color: #000; border: none; padding: 14px;
          border-radius: 12px; font-family: 'Tajawal', sans-serif; font-size: 16px;
          font-weight: 800; cursor: pointer; transition: all 0.2s;
          box-sizing: border-box;
        }
        .login-btn:active { transform: scale(0.98); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{
        width: "100%", maxWidth: 360, background: "rgba(255,255,255,0.02)",
        padding: 30, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center", animation: "slideUp 0.5s ease-out both"
      }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#fff", fontFamily: "'Tajawal', sans-serif" }}>تسجيل الدخول</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#a1a1aa", fontFamily: "'Tajawal', sans-serif" }}>مرحباً بك مجدداً في متتبع العادات</p>
        
        <form onSubmit={handleLogin} style={{ margin: 0 }}>
          <input 
            type="text" placeholder="اسم المستخدم" className="login-input" 
            value={username} onChange={e => setUsername(e.target.value)} 
          />
          <input 
            type="password" placeholder="كلمة المرور" className="login-input" 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          {loginError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, fontFamily: "'Tajawal', sans-serif" }}>{loginError}</div>}
          <button type="submit" className="login-btn">دخول</button>
        </form>
      </div>
    </div>
  );
}
