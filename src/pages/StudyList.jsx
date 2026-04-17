import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './StudyList.css';

/* ── Components (duplicated for now or can be extracted) ── */
const ProgressRing = ({ percent }) => {
  const r = 18;
  const c = 2 * Math.PI * r;
  const filled = c - (c * percent) / 100;
  return (
    <svg className="progress-ring" viewBox="0 0 44 44" width="44" height="44">
      <circle cx="22" cy="22" r={r} className="progress-ring__track" />
      <circle
        cx="22"
        cy="22"
        r={r}
        className="progress-ring__fill"
        strokeDasharray={c}
        strokeDashoffset={filled}
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="22" className="progress-ring__text" dominantBaseline="central" textAnchor="middle">
        {percent}%
      </text>
    </svg>
  );
};

const TAG_COLORS = {
  '한국사': { bg: '#FFF0F5', color: '#D6335A' },
  '수능':   { bg: '#FFF7E6', color: '#C77700' },
  '영어':   { bg: '#E8F4FF', color: '#0066CC' },
  '자격증': { bg: '#F0EEFF', color: '#5E35B1' },
  'CS':     { bg: '#E8FBF0', color: '#00913A' },
};
const DEFAULT_TAG = { bg: 'var(--primary-light)', color: 'var(--primary)' };

const Tag = ({ label }) => {
  const style = TAG_COLORS[label] || DEFAULT_TAG;
  return (
    <span
      className="ps-tag"
      style={{ '--tag-bg': style.bg, '--tag-color': style.color }}
    >
      {label}
    </span>
  );
};

const StudyCard = ({ item, onNavigate, index, onDelete }) => {
  const isCompleted = item.progress === 100;
  return (
    <div
      className={`study-card animate-fade-up cursor-pointer ${isCompleted ? 'study-card--done' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onNavigate && onNavigate('summary_detail', item.id)}
      role="button"
      tabIndex={0}
    >
      <div className="study-card__top">
        <div className="study-card__tags">
          {item.tags.map(t => <Tag key={t} label={t} />)}
        </div>
        <ProgressRing percent={item.progress} />
      </div>

      <h2 className="study-card__title">{item.title}</h2>
      <p className="study-card__summary">{item.summary}</p>

      <div className="study-card__bar-wrap">
        <div className="study-card__bar">
          <div className="study-card__bar-fill" style={{ width: `${item.progress}%` }} />
        </div>
        <span className="study-card__bar-label">{item.solvedQuiz}/{item.totalQuiz} 문제</span>
      </div>

      <div className="study-card__footer">
        <div className="study-card__meta">
          {item.badge && <span className="study-card__badge">{item.badge}</span>}
          <span className="study-card__date">{item.date}</span>
        </div>
        <div className="study-card__actions">
          <button
            className="study-card__cta"
            onClick={e => {
              e.stopPropagation();
              onNavigate && onNavigate(isCompleted ? 'mytests' : 'summary_detail', item.id);
            }}
          >
            학습하기
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button
            className="study-card__delete"
            onClick={e => {
              e.stopPropagation();
              onDelete && onDelete(item.id, item.title);
            }}
            aria-label="삭제"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudyList = ({ onNavigate }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      if (!supabase) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('study')
        .select('*')
        .order('createtime', { ascending: false });

      if (error) {
        if (error.message.includes('column "createtime" does not exist')) {
           const { data: retryData, error: retryError } = await supabase
             .from('study')
             .select('*')
             .order('created_at', { ascending: false });
           if (retryError) throw retryError;
           updateSessionState(retryData);
           return;
        }
        throw error;
      }

      updateSessionState(data);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionState = (data) => {
    if (!data) return;
    const formattedData = data.map(item => ({
      id: item.id,
      tags: item.category ? [item.category] : [],
      title: item.study_name || '제목 없음',
      summary: item.summary || '요약 내용을 생성 중이거나 내용이 없습니다.', 
      progress: 0, 
      totalQuiz: 10,
      solvedQuiz: 0,
      date: item.createtime || item.created_at 
        ? new Date(item.createtime || item.created_at).toLocaleDateString() 
        : '날짜 정보 없음',
      score: null,
      badge: null,
    }));
    setSessions(formattedData);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`'${title}' 학습 자료를 삭제하시겠습니까?`)) {
      try {
        const { error } = await supabase
          .from('study')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        alert('삭제완료 되었습니다.');
        fetchSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel('public:study_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study' }, (payload) => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const ongoing = sessions.filter(s => s.progress < 100);
  const completed = sessions.filter(s => s.progress === 100);

  return (
    <div className="study-list">
      <header className="study-list__header">
        <div className="study-list__header-top">
          <div>
            <p className="study-list__label">내 학습 관리</p>
            <h1 className="study-list__title">학습 목록</h1>
          </div>
          <button className="study-list__create-btn" onClick={() => onNavigate('upload')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            새 학습 추가
          </button>
        </div>
        <div className="study-list__summary">
          <div className="study-summary-pill">
            <span className="study-summary-pill__num">{sessions.length}</span>
            <span className="study-summary-pill__lbl">전체</span>
          </div>
          <div className="study-summary-pill study-summary-pill--ongoing">
            <span className="study-summary-pill__num">{ongoing.length}</span>
            <span className="study-summary-pill__lbl">학습 중</span>
          </div>
          <div className="study-summary-pill study-summary-pill--done">
            <span className="study-summary-pill__num">{completed.length}</span>
            <span className="study-summary-pill__lbl">완료</span>
          </div>
        </div>
      </header>

      <div className="study-list__body">
        {loading ? (
          <div className="study-list__loading">데이터를 불러오는 중...</div>
        ) : (
          <>
            {ongoing.length > 0 && (
              <section className="study-section">
                <div className="study-section__head">
                  <h2 className="study-section__title">진행 중인 학습</h2>
                  <span className="study-section__count">{ongoing.length}</span>
                </div>
                {ongoing.map((item, i) => (
                  <StudyCard key={item.id} item={item} onNavigate={onNavigate} onDelete={handleDelete} index={i} />
                ))}
              </section>
            )}

            {completed.length > 0 && (
              <section className="study-section">
                <div className="study-section__head">
                  <h2 className="study-section__title">완료된 학습</h2>
                  <span className="study-section__count study-section__count--done">{completed.length}</span>
                </div>
                {completed.map((item, i) => (
                  <StudyCard key={item.id} item={item} onNavigate={onNavigate} onDelete={handleDelete} index={i} />
                ))}
              </section>
            )}

            {sessions.length === 0 && (
              <div className="study-empty animate-fade-up">
                <div className="placeholder-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h3>아직 학습 자료가 없어요</h3>
                <p>새 학습 추가 버튼을 눌러 첫 학습을 시작해보세요!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyList;
