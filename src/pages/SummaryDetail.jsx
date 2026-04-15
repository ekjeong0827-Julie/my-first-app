import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../supabaseClient';
import './SummaryDetail.css';

const SummaryDetail = ({ activeSummaryId, onNavigate }) => {
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudyDetail = async () => {
      if (!activeSummaryId) return;
      
      try {
        const { data, error } = await supabase
          .from('study')
          .select('*')
          .eq('id', activeSummaryId)
          .single();

        if (error) throw error;
        setStudy(data);
      } catch (error) {
        console.error('Error fetching study detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyDetail();
  }, [activeSummaryId]);

  if (loading) return <div className="detail-container">로딩 중...</div>;
  if (!study) return <div className="detail-container">자료를 불러올 수 없습니다.</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        <svg viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        목록으로 돌아가기
      </button>

      <div className="detail-header">
        <div className="detail-tags">
          <span className="tag">{study.category}</span>
        </div>
        <h1 className="detail-title">{study.study_name}</h1>
        <div className="card-date">{new Date(study.createtime).toLocaleDateString()} 등록됨</div>
      </div>

      <div className="detail-content ai-summary">
        <h2 className="content-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          AI 핵심 요약
        </h2>
        <div className="markdown-body">
          <ReactMarkdown>{study.summary || "요약된 내용이 없습니다."}</ReactMarkdown>
        </div>
      </div>

      <button 
        className="generate-floating-btn" 
        onClick={() => onNavigate('test', study.category)}
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
