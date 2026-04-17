import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../supabaseClient';
import { generateQuestions } from '../aiService';
import './SummaryDetail.css';

const SlideToComplete = ({ onComplete, isCompleted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const trackRef = useRef(null);

  const handleStart = (e) => {
    if (isCompleted) return;
    setIsDragging(true);
    setStartX(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
  };

  const handleMove = (e) => {
    if (!isDragging || isCompleted) return;
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    const maxSlide = trackRef.current.offsetWidth - 32; // 28px circle + 4px margin
    const newTranslate = Math.max(0, Math.min(diff, maxSlide));
    setTranslateX(newTranslate);
  };

  const handleEnd = () => {
    if (!isDragging || isCompleted) return;
    setIsDragging(false);
    const maxSlide = trackRef.current.offsetWidth - 32;
    if (translateX > maxSlide * 0.7) {
      setTranslateX(maxSlide);
      onComplete();
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div 
      className={`slide-track ${isCompleted ? 'completed' : ''}`} 
      ref={trackRef}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div 
        className="slide-handle"
        style={{ transform: `translateX(${isCompleted ? 'calc(100% - 32px)' : translateX + 'px'})` }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {isCompleted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </div>
      <span className="slide-text">
        {isCompleted ? '완료' : '학습완료'}
      </span>
    </div>
  );
};


const SummaryDetail = ({ activeSummaryId, onNavigate }) => {
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSections, setCompletedSections] = useState({});

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

  const handleCreateQuestions = async () => {
    if (!study || !study.summary) return;
    
    setIsGenerating(true);
    try {
      const questions = await generateQuestions(study.summary, { count: 6, type: 'mixed' });
      onNavigate('quiz', questions);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('문제 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

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
        <h1 className="detail-title">{study.study_name}</h1>
        <div className="detail-meta">
          <span className="tag">{study.category}</span>
          <span className="detail-date">{new Date(study.createtime).toLocaleDateString()} 등록됨</span>
        </div>
      </div>

      <div className="detail-content ai-summary">
        <h2 className="content-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          AI 핵심 요약
        </h2>
        <div className="markdown-body">
          {(() => {
            const content = study.summary || "요약된 내용이 없습니다.";
            // Split by ## Heading
            const sections = content.split(/(?=^##\s)/m);
            
            return sections.map((section, idx) => (
              <div key={idx} className="summary-section">
                <ReactMarkdown>{section}</ReactMarkdown>
                {section.trim() && (idx > 0 || sections.length === 1) && (
                  <div className="section-footer">
                    <SlideToComplete 
                      isCompleted={completedSections[idx]} 
                      onComplete={() => setCompletedSections(prev => ({ ...prev, [idx]: true }))} 
                    />
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>


    </div>
  );
};

export default SummaryDetail;
