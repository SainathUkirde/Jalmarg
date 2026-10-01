// Sidebar navigation component
import React from 'react';
import { useAppStore } from '../../store/appStore';
import type { AppStep, NavSection } from '../../types';

const NAV_ITEMS: { icon: string; label: string; nav: NavSection; step?: AppStep }[] = [
  { icon: '◈', label: 'Dashboard',    nav: 'dashboard'     },
  { icon: '⊙', label: 'Fleet View',   nav: 'fleet'         },
  { icon: '∿', label: 'Analytics',    nav: 'analytics'     },
  { icon: '⟁', label: 'Optimization', nav: 'optimization'  },
  { icon: '≡', label: 'Benchmarking', nav: 'benchmarking'  },
  { icon: '✓', label: 'Constraints',  nav: 'constraints'   },
  { icon: '⊞', label: 'Data Sources', nav: 'datasources'   },
  { icon: '↓', label: 'Report',       nav: 'report'        },
];

export default function Sidebar() {
  const { currentNav, setNav, backendLive, theme, toggleTheme } = useAppStore();

  return (
    <aside
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      className="flex flex-col h-screen w-16 lg:w-60 flex-shrink-0 overflow-hidden"
    >
      {/* Brand */}
      <div className="px-3 lg:px-5 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <div className="text-white font-semibold text-sm leading-tight font-display">Jalmarg</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing:'0.05em' }}>QUANTUM · INDIA</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="text-label px-2 mb-2 hidden lg:block">Navigation</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.nav}
            onClick={() => setNav(item.nav)}
            className={`nav-item w-full mb-0.5 ${currentNav === item.nav ? 'active' : ''}`}
            aria-current={currentNav === item.nav ? 'page' : undefined}
          >
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            <span className="hidden lg:block truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom: connection + theme */}
      <div className="px-3 py-3 border-t space-y-2" style={{ borderColor: 'var(--sidebar-border)' }}>
        {/* Connection */}
        <div className="hidden lg:flex items-center gap-2">
          <span className={`status-dot ${backendLive ? 'status-dot-success' : 'status-dot-warning'}`}></span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {backendLive ? 'Live API' : 'Offline Mode'}
          </span>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nav-item w-full"
          aria-label="Toggle theme"
        >
          <span className="text-base">{theme === 'dark' ? '☀' : '◑'}</span>
          <span className="hidden lg:block text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}
