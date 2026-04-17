import React, { useState, useEffect } from 'react';
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
import StudyList from './pages/StudyList';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeSummaryId, setActiveSummaryId] = useState(null);
  const [prefilledCategory, setPrefilledCategory] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [tests, setTests] = useState(() => {
    const saved = localStorage.getItem('savedTests');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddTest = (newTest) => {
    setTests(prev => [newTest, ...prev]);
  };

  const handleNavigate = (tab, payload) => {
    setActiveTab(tab);
    if (tab === 'solve') setActiveTestId(payload);
    if (tab === 'summary_detail') setActiveSummaryId(payload);
    if (tab === 'test' && payload) setPrefilledCategory(payload);
    if (tab === 'result') setQuizResults(payload);
    if (tab === 'quiz' && payload) setQuizQuestions(payload);
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
            onAddTest={handleAddTest}
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
        return (
          <Quiz 
            onNavigate={handleNavigate} 
            initialQuestions={quizQuestions} 
          />
        );
      case 'study':
        return <StudyList onNavigate={handleNavigate} />;
      case 'mytests':
        return <MyTests tests={tests} onNavigate={handleNavigate} />;
      case 'solve':
        return (
          <TestSolving 
            activeTest={tests.find(t => t.id === activeTestId)} 
            onNavigate={handleNavigate} 
          />
        );
      case 'result':
        return <ResultReport results={quizResults} onNavigate={handleNavigate} />;
      case 'remind':
        return (
          <div className="placeholder-page animate-fade-up">
            <div className="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h3 className="h2">복습 카드함</h3>
            <p className="body">곧 추가될 예정입니다.</p>
          </div>
        );
      case 'profile':
        return (
          <div className="placeholder-page animate-fade-up">
            <div className="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 className="h2">프로필</h3>
            <p className="body">곧 추가될 예정입니다.</p>
          </div>
        );
      default:
        return <MainFeed onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="mobile-container">
      <Layout 
        activeTab={activeTab} 
        onNavigate={handleNavigate}
      >
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;
