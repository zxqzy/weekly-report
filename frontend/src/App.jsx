import React, { useEffect } from 'react';
import WeekSelector from './components/WeekSelector.jsx';
import RecordList from './components/RecordList.jsx';
import ReportPanel from './components/ReportPanel.jsx';
import HistoryList from './components/HistoryList.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import useStore from './store/useStore.js';

export default function App() {
  const { activeTab, setActiveTab, currentWeekStart, fetchRecords, fetchWeekReport } = useStore();

  // 首次加载时拉取当前周数据
  useEffect(() => {
    fetchRecords(currentWeekStart);
    fetchWeekReport(currentWeekStart);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    { key: 'records', label: '📝 本周事项' },
    { key: 'report', label: '🤖 周报生成' },
    { key: 'history', label: '📋 历史周报' },
  ];

  return (
    <div className="app-layout">
      {/* 顶部 Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">✨</span>
            <span className="brand-name">AI 周报系统</span>
          </div>
          <WeekSelector />
        </div>
      </header>

      {/* Tab 导航 */}
      <nav className="app-tabs">
        <div className="tabs-inner">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              data-testid={`tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="app-main">
        <div className="main-inner">
          {activeTab === 'records' && <RecordList />}
          {activeTab === 'report' && <ReportPanel />}
          {activeTab === 'history' && <HistoryList />}
        </div>
      </main>

      {/* Toast 通知 */}
      <ToastContainer />

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .app-header {
          background: #fff;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .brand-icon { font-size: 22px; }
        .brand-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .app-tabs {
          background: #fff;
          border-bottom: 1px solid var(--border);
        }
        .tabs-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          gap: 4px;
        }
        .tab-btn {
          padding: 12px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .tab-btn:hover { color: var(--primary); }
        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .app-main {
          flex: 1;
          padding: 24px 20px;
        }
        .main-inner {
          max-width: 900px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
