import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import AppShell from './components/layout/AppShell';

export default function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <AppShell />;
}
