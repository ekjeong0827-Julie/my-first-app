import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './MainFeed.css';

/* ── Mock data ── */
const STUDY_SESSIONS_DATA = [
  {
    id: 1,
    tags: ['한국사', '수능'],
    title: '2025학년도 수능 대비 한국사 핵심 요약',
    summary: '일제강점기 저항운동의 흐름과 주요 단체(의열단, 한인애국단)의 활동 및 성과.',
    progress: 72,
    totalQuiz: 18,
    solvedQuiz: 13,
    date: '어제',
    score: null,
    badge: '🔥',
  },
  {
    id: 2,
    tags: ['영어'],
    title: '고3 모의고사 빈칸추론 유형 분석',
    summary: '빈칸추론 문제에서 자주 출제되는 논리적 연결어와 패러프레이징 패턴 중심 요약.',
    progress: 100,
    totalQuiz: 10,
    solvedQuiz: 10,
    date: '3일 전',
    score: 85,
    badge: '✅',
  },
  {
    id: 3,
    tags: ['자격증', 'CS'],
    title: '정보처리기사 실기 - 데이터베이스 핵심',
    summary: 'SQL 쿼리 최적화, 정규화(1NF~3NF), 트랜잭션 ACID 속성 완전 정리.',
    progress: 30,
    totalQuiz: 20,
    solvedQuiz: 6,
    date: '1주일 전',
    score: null,
    badge: null,
  },
];

const TODAY_STATS = {
  solved: 13,
  correct: 10,
  streak: 5,
  reminds: 3,
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
  return (
    <div
      className="study-card animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onNavigate && onNavigate('summary_detail', item.id)}
      role="button"
      tabIndex={0}
    >
      <div className="study-card__header-row">
        <div className="study-card__tags">
          {item.tags && item.tags.map(tag => <Tag key={tag} label={tag} />)}
        </div>
        <span className="study-card__date-simple">{item.date}</span>
      </div>

      <div className="study-card__body">
        <h2 className="study-card__title">{item.title}</h2>
        <p className="study-card__summary">{item.summary}</p>
      </div>

      <div className="study-card__footer">
        <div className="study-card__actions">
          <button
            className="study-card__cta"
            onClick={e => {
              e.stopPropagation();
              onNavigate && onNavigate('summary_detail', item.id);
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

const ExamCard = ({ item, onNavigate, index }) => {
  return (
    <div
      className="exam-card animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onNavigate && onNavigate('quiz', item.id)}
      role="button"
      tabIndex={0}
    >
      <div className="exam-card__header-row">
        <span className="exam-card__badge-pill">시험</span>
        {item.questionCount && <span className="exam-card__count-tag">{item.questionCount}문항</span>}
      </div>

      <div className="exam-card__body">
        <h2 className="exam-card__title">{item.title}</h2>
        <p className="exam-card__summary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" style={{ marginRight: 4, opacity: 0.6 }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          {item.studyTitle || '관련 학습 자료'}
        </p>
      </div>

      <div className="exam-card__footer">
        <button
          className="exam-card__cta"
          onClick={e => {
            e.stopPropagation();
            onNavigate && onNavigate('quiz', item.id);
          }}
        >
          응시하기
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const StatPill = ({ icon, value, label, color }) => (
  <div className="stat-pill" style={{ '--stat-color': color }}>
    <span className="stat-pill__icon">{icon}</span>
    <div>
      <div className="stat-pill__value">{value}</div>
      <div className="stat-pill__label">{label}</div>
    </div>
  </div>
);

const RemindBanner = ({ count, onNavigate }) => {
  if (count === 0) return null;
  return (
    <button className="remind-banner animate-fade-up" onClick={() => onNavigate && onNavigate('remind')}>
      <span className="remind-banner__icon">🔔</span>
      <div className="remind-banner__text">
        <strong>복습할 카드 {count}장이 기다리고 있어요!</strong>
        <span>망각곡선 최적 시점에 맞춰 복습하세요</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );
};

const MainFeed = ({ onNavigate }) => {
  const [sessions, setSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 학습 세션 삭제하기
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

  // 학습 세션 데이터 가져오기 (Supabase)
  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('study')
        .select('*')
        .order('createtime', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(item => ({
        id: item.id,
        tags: [item.category],
        title: item.study_name,
        summary: item.summary || '요약 내용을 생성 중이거나 내용이 없습니다.', 
        date: new Date(item.createtime).toLocaleDateString(),
      }));

      setSessions(formattedData);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    }
  };

  // 시험 데이터 가져오기 (LocalStorage)
  const fetchExams = () => {
    const saved = localStorage.getItem('savedExams');
    const examsData = saved ? JSON.parse(saved) : [];
    setExams(examsData);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSessions();
      fetchExams();
      setLoading(false);
    };
    init();

    const channel = supabase
      .channel('public:study_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study' }, (payload) => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const accuracy = Math.round((TODAY_STATS.correct / TODAY_STATS.solved) * 100);

  return (
    <div className="feed">
      {/* ─── Header ─── */}
      <header className="feed__header">
        <div className="feed__header-top">
          <div>
            <p className="feed__greeting">안녕하세요 👋</p>
            <h1 className="feed__title">오늘도 Perfect Score!</h1>
          </div>
          <button className="feed__bell" aria-label="알림">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="feed__bell-dot" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <StatPill icon="📝" value={TODAY_STATS.solved} label="오늘 푼 문제" color="var(--primary)" />
          <StatPill icon="🎯" value={`${accuracy}%`} label="정답률" color="var(--success)" />
          <StatPill icon="🔥" value={`${TODAY_STATS.streak}일`} label="연속 학습" color="#FF7043" />
        </div>
      </header>

      <div className="feed__body">
        {/* Remind Banner */}
        <RemindBanner count={TODAY_STATS.reminds} onNavigate={onNavigate} />

        {/* 나의 학습 */}
        <section className="feed__section">
          <div className="feed__section-header">
            <h2 className="feed__section-title">나의 학습</h2>
            <span className="feed__section-badge">{sessions.length}</span>
          </div>
          {sessions.length > 0 ? (
            sessions.slice(0, 3).map((item, i) => (
              <StudyCard key={item.id} item={item} onNavigate={onNavigate} onDelete={handleDelete} index={i} />
            ))
          ) : (
            <div className="feed__empty-inline">아직 학습 자료가 없습니다.</div>
          )}
          {sessions.length > 3 && (
            <button className="feed__more-btn" onClick={() => onNavigate('study')}>학습 전체 보기</button>
          )}
        </section>

        {/* 나의 시험 */}
        <section className="feed__section">
          <div className="feed__section-header">
            <h2 className="feed__section-title">나의 시험</h2>
            <span className="feed__section-badge feed__section-badge--done">{exams.length}</span>
          </div>
          {exams.length > 0 ? (
            exams.slice(0, 3).map((item, i) => (
              <ExamCard key={item.id} item={item} onNavigate={onNavigate} index={i} />
            ))
          ) : (
            <div className="feed__empty-inline">아직 생성된 시험이 없습니다.</div>
          )}
          {exams.length > 3 && (
            <button className="feed__more-btn" onClick={() => onNavigate('exam')}>시험 전체 보기</button>
          )}
        </section>
      </div>
    </div>
  );
};

export default MainFeed;
