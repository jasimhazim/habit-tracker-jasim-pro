import { useState, useEffect } from 'react';
import './index.css';
import MobileApp from './components/MobileApp';
import DesktopApp from './components/DesktopApp';
import AuthView from './components/AuthView';

export default function App() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('pro_token');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('pro_token');
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    verifyToken();
  }, []);

  if (isCheckingAuth) {
    return <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>;
  }

  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  return isDesktop ? <DesktopApp user={user} /> : <MobileApp user={user} />;
}
