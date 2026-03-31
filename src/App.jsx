import React, { useState } from 'react';
import Layout from './components/Layout';
import MainFeed from './pages/MainFeed';
import FileUpload from './pages/FileUpload';
import TestGeneration from './pages/TestGeneration';
import MyTests from './pages/MyTests';
import TestSolving from './pages/TestSolving';
import SummaryDetail from './pages/SummaryDetail';
import ExamList from './pages/ExamList';
import Quiz from './pages/Quiz';
import ResultReport from './pages/ResultReport';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeSummaryId, setActiveSummaryId] = useState(null);
  const [prefilledCategory, setPrefilledCategory] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  const handleNavigate = (tab, payload) => {
    setActiveTab(tab);
    if (tab === 'solve') setActiveTestId(payload);
    if (tab === 'summary_detail') setActiveSummaryId(payload);
    if (tab === 'test' && payload) setPrefilledCategory(payload);
    if (tab === 'result') setQuizResults(payload);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MainFeed onNavigate={handleNavigate} />;
      case 'upload':
        return <FileUpload onNavigate={handleNavigate} />;
      case 'test':
        return (
          <TestGeneration
            onNavigate={handleNavigate}
            prefilledCategory={prefilledCategory}
          />
        );
      case 'summary_detail':
        return (
          <SummaryDetail
            activeSummaryId={activeSummaryId}
            onNavigate={handleNavigate}
          />
        );
      case 'exam':
        return <ExamList onNavigate={handleNavigate} />;
      case 'quiz':
        return <Quiz onNavigate={handleNavigate} />;
      case 'study':
        return <MyTests onNavigate={handleNavigate} />;
      case 'mytests':
        return <MyTests onNavigate={handleNavigate} />;
      case 'solve':
        return <TestSolving activeTestId={activeTestId} onNavigate={handleNavigate} />;
      case 'result':
        return <ResultReport results={quizResults} onNavigate={handleNavigate} />;
      case 'remind':
        return (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>복습 카드함</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>곧 추가될 예정입니다.</p>
          </div>
        );
      case 'profile':
        return (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>👤</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>프로필</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>곧 추가될 예정입니다.</p>
          </div>
        );
      default:
        return <MainFeed onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="mobile-container">
      <Layout activeTab={activeTab} onNavigate={handleNavigate}>
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;
