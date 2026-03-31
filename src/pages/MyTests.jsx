import React from 'react';
import './MyTests.css';

const MyTests = ({ tests = [], onNavigate }) => {
  return (
    <div className="mytests-container">
      <div className="mytests-header">
        <h1 className="mytests-title">내 시험지 관리</h1>
        <p className="mytests-subtitle">생성된 시험문제를 확인하고 학습을 진행하세요.</p>
      </div>

      {tests.map(test => (
        <div key={test.id} className="test-card">
          <div className="test-card-header">
            <h2 className="test-card-title">{test.title}</h2>
            <div className="test-card-meta">{test.status}</div>
          </div>
          
          <div className="test-card-details">
            <div className="detail-item">
              <strong>과목:</strong> {test.categories.join(', ')}
            </div>
            <div className="detail-item">
              <strong>문항수:</strong> {test.questionCount}문제
            </div>
            <div className="detail-item">
              <strong>생성일:</strong> {test.date}
            </div>
          </div>

          <div className="test-card-actions">
            {test.status === '미응시' ? (
              <button className="btn-primary" onClick={() => onNavigate && onNavigate('solve', test.id)}>
                시험 응시하기
              </button>
            ) : test.status === '채점완료' ? (
              <>
                <button className="btn-secondary">결과 분석</button>
                <button className="btn-secondary">오답노트</button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => onNavigate && onNavigate('solve', test.id)}>
                이어서 풀기
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyTests;
