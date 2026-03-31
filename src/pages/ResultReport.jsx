import React from 'react';
import './ResultReport.css';

const ResultReport = ({ results, onNavigate }) => {
  if (!results) {
    return (
      <div className="result-error">
        <h2>결과를 불러올 수 없습니다.</h2>
        <button className="primary-btn" onClick={() => onNavigate('home')}>홈으로 가기</button>
      </div>
    );
  }

  const { score, total, correctCount, weakKeywords, type } = results;

  const getMessage = (s) => {
    if (s >= 90) return '🏆 완벽합니다! 지식을 마스터하셨네요.';
    if (s >= 70) return '👍 훌륭해요! 조금만 더 하면 완벽해질 거예요.';
    if (s >= 40) return '💪 노력이 결실을 맺고 있어요. 화이팅!';
    return '🌱 다시 한번 꼼꼼히 읽어볼까요? 할 수 있어요!';
  };

  const handleRetake = () => {
    if (type === 'quiz') {
      onNavigate('quiz');
    } else {
      onNavigate('mytests'); // Or 'solve' with the specific test ID if stored
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Perfect Score 학습 결과',
        text: `내 점수는 ${score}점! 함께 공부해요.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('공유하기 기능이 이 브라우저에서 지원되지 않습니다. (점수: ' + score + '점)');
    }
  };

  return (
    <div className="result-container animate-fade-in">
      <header className="result-header">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h1 className="header-title">학습 결과 리포트</h1>
      </header>

      <main className="result-content">
        <section className="score-section">
          <div className="score-circle-root">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="54" className="score-track" />
              <circle
                cx="60"
                cy="60"
                r="54"
                className="score-fill"
                strokeDasharray={`${339.3 * score / 100} 339.3`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="score-text-wrap">
              <span className="score-number">{score}</span>
              <span className="score-label">점</span>
            </div>
          </div>
          <h2 className="result-message">{getMessage(score)}</h2>
          <p className="result-stats">{total}문제 중 {correctCount}개 정답</p>
        </section>

        {weakKeywords && weakKeywords.length > 0 && (
          <section className="analysis-section">
            <h3 className="section-title">취약 키워드 분석 TOP 3</h3>
            <div className="keyword-list">
              {weakKeywords.slice(0, 3).map((kw, i) => (
                <div key={i} className="keyword-tag">
                  <span className="keyword-rank">{i + 1}</span>
                  <span className="keyword-name">{kw}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="action-section">
          <button className="action-btn action-btn--secondary" onClick={handleRetake}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            다시 풀기
          </button>
          <button className="action-btn action-btn--secondary" onClick={() => alert('복습 카드함에 저장되었습니다!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            복습 카드로 저장
          </button>
          <button className="action-btn action-btn--primary" onClick={handleShare}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            결과 공유하기
          </button>
        </section>
      </main>
      
      <div className="home-footer">
        <button className="home-btn" onClick={() => onNavigate('home')}>홈으로 돌아가기</button>
      </div>
    </div>
  );
};

export default ResultReport;
