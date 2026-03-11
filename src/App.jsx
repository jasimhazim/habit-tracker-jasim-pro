import { useState, useEffect } from 'react';
import './index.css';
import MobileApp from './components/MobileApp';
import DesktopApp from './components/DesktopApp';

export default function App() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop ? <DesktopApp /> : <MobileApp />;
}
