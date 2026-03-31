import React from 'react';
import './SummaryDetail.css';

const SummaryDetail = ({ activeSummary, onNavigate, onStartGeneration }) => {
  if (!activeSummary) {
    return <div>자료를 불러올 수 없습니다.</div>;
  }

  // Fallback details if mock doesn't have it
  const details = activeSummary.details || [
    {
      heading: '1. 구조 미파악된 핵심 강령',
      points: ['업로드 시 AI가 세부 분석을 진행중이거나 처리하지 못했습니다.', '기본 요약을 바탕으로 출제를 할 수 있습니다.']
    }
  ];

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => onNavigate('summary')}>
        <svg viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        목록으로 돌아가기
      </button>

      <div className="detail-header">
        <div className="detail-tags">
          {activeSummary.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <h1 className="detail-title">{activeSummary.title}</h1>
        <div className="card-date">{activeSummary.date} 등록됨</div>
      </div>

      <div className="detail-toc">
        <h2 className="toc-title">
          <svg viewBox="0 0 24 24">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          요약 목차 (TOC)
        </h2>
        <ul className="toc-list">
          {details.map((section, idx) => (
            <li key={idx} className="toc-item">{section.heading}</li>
          ))}
        </ul>
      </div>

      <div className="detail-content">
        {details.map((section, idx) => (
          <div key={idx} className="content-section">
            <h3 className="section-heading">{section.heading}</h3>
            <ul className="section-points">
              {section.points.map((point, pIdx) => (
                <li key={pIdx}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button 
        className="generate-floating-btn" 
        onClick={() => onStartGeneration(activeSummary.tags[0])}
        title="이 자료로 문제 출제하기"
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>
    </div>
  );
};

export default SummaryDetail;
