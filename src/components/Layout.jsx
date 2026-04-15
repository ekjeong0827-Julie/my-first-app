import React from 'react';
import './Layout.css';

const NavItem = ({ children, label, active, onClick }) => (
  <button className={`nav-item ${active ? 'nav-item--active' : ''}`} onClick={onClick} aria-label={label}>
    <span className="nav-icon">{children}</span>
    <span className="nav-label">{label}</span>
  </button>
);

const Layout = ({ children, activeTab, onNavigate, theme, toggleTheme }) => {
  return (
    <div className="layout">
      {/* Theme Toggle Button */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme} 
        aria-label="모드 전환"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <main className="layout__main">
        {children}
      </main>
      <nav className="bottom-nav" role="navigation">
        <NavItem
          label="홈"
          active={activeTab === 'home'}
          onClick={() => onNavigate('home')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <polyline points="9 21 9 12 15 12 15 21"/>
          </svg>
        </NavItem>

        <NavItem
          label="학습"
          active={activeTab === 'study'}
          onClick={() => onNavigate('study')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </NavItem>

        {/* FAB spacer */}
        <div className="nav-fab-spacer" />

        <NavItem
          label="시험"
          active={activeTab === 'exam' || activeTab === 'exam_create'}
          onClick={() => onNavigate('exam')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </NavItem>

        <NavItem
          label="복습"
          active={activeTab === 'remind'}
          onClick={() => onNavigate('remind')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </NavItem>

        {/* Center FAB */}
        <button
          className="nav-fab"
          onClick={() => onNavigate('upload')}
          aria-label="새 학습 시작"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
