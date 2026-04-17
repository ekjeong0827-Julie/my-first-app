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
  '한국사': { bg: '#FEE2E2', color: '#991B1B' }, // Soft Red
  '수능':   { bg: '#FEF3C7', color: '#92400E' }, // Soft Amber
  '영어':   { bg: '#E0F2F1', color: '#00695C' }, // Soft Teal
  '자격증': { bg: '#F0FDF4', color: '#166534' }, // Soft Green
  'CS':     { bg: '#D1FAE5', color: '#065F46' }, // Soft Emerald
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

/* ── Skeleton Loaders for better perceived speed ── */
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-badge" />
      <div className="skeleton-date" />
    </div>
    <div className="skeleton-title" />
    <div className="skeleton-footer">
      <div className="skeleton-btn" />
      <div className="skeleton-btn-sm" />
    </div>
  </div>
);

const StudyCard = ({ item, onNavigate, index, onDelete }) => {
  return (
    <div
      className="study-card animate-fade-up cursor-pointer"
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

const ExamCard = ({ item, onNavigate, index, onDelete }) => {
  return (
    <div
      className="exam-card animate-fade-up cursor-pointer"
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
      </div>

      <div className="exam-card__footer">
        <div className="exam-card__actions">
          <button
            className="exam-card__cta"
            onClick={e => {
              e.stopPropagation();
              onNavigate && onNavigate('quiz', item.questions);
            }}
          >
            응시하기
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button
            className="exam-card__delete"
            onClick={e => {
              e.stopPropagation();
              onDelete && onDelete(item.id, item.title);
            }}
            aria-label="시험 삭제"
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

const StatPill = ({ icon, value, label, color }) => (
  <div className="stat-pill" style={{ '--stat-color': color }}>
    <span className="stat-pill__icon">
      {icon}
    </span>
    <div>
      <div className="stat-pill__value">{value}</div>
      <div className="stat-pill__label">{label}</div>
    </div>
  </div>
);

const RemindBanner = ({ count, onNavigate }) => {
  if (count === 0) return null;
  return (
    <button className="remind-banner animate-fade-up cursor-pointer" onClick={() => onNavigate && onNavigate('remind')}>
      <span className="remind-banner__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </span>
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

  // 시험 삭제하기 (Supabase)
  const handleDeleteExam = async (id, title) => {
    if (window.confirm(`'${title}' 시험을 삭제하시겠습니까?`)) {
      try {
        const { error } = await supabase
          .from('exams')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        alert('삭제되었습니다.');
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  // 학습 세션 데이터 가져오기 (Supabase)
  const fetchSessions = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client is not initialized');
        return;
      }

      const { data, error } = await supabase
        .from('study')
        .select('*')
        .order('createtime', { ascending: false });

      if (error) {
        console.error('Supabase error (study):', error);
        // 만약 createtime 컬럼 오류라면 created_at으로 재시도 (일부 환경 대비)
        if (error.message.includes('column "createtime" does not exist')) {
           console.log('Retrying with created_at...');
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
    }
  };

  const updateSessionState = (data) => {
    if (!data) return;
    const formattedData = data.map(item => ({
      id: item.id,
      tags: item.category ? [item.category] : [],
      title: item.study_name || '제목 없음',
      summary: item.summary || '요약 내용을 생성 중이거나 내용이 없습니다.', 
      date: item.createtime || item.created_at 
        ? new Date(item.createtime || item.created_at).toLocaleDateString() 
        : '날짜 정보 없음',
    }));
    setSessions(formattedData);
  };

  // 시험 데이터 가져오기 (Supabase)
  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(e => ({
        ...e,
        studyTitle: e.study_title,
        questionCount: e.question_count,
        questionType: e.question_type,
        answerMode: e.answer_mode,
        date: new Date(e.created_at).toLocaleDateString()
      }));

      setExams(formatted);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // 병렬로 데이터 패칭 진행하여 로딩 속도 최적화
      await Promise.all([fetchSessions(), fetchExams()]);
      setLoading(false);
    };
    init();

    const studyChannel = supabase
      .channel('public:study_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study' }, (payload) => {
        fetchSessions();
      })
      .subscribe();

    const examChannel = supabase
      .channel('public:exams_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, (payload) => {
        fetchExams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studyChannel);
      supabase.removeChannel(examChannel);
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
          <StatPill 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>} 
            value={TODAY_STATS.solved} 
            label="오늘 푼 문제" 
            color="var(--primary)" 
          />
          <StatPill 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>} 
            value={`${accuracy}%`} 
            label="정답률" 
            color="var(--success)" 
          />
          <StatPill 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>} 
            value={`${TODAY_STATS.streak}일`} 
            label="연속 학습" 
            color="#FF7043" 
          />
        </div>
      </header>

      <div className="feed__body">
        {/* Remind Banner */}
        <RemindBanner count={TODAY_STATS.reminds} onNavigate={onNavigate} />

        {/* 나의 학습 */}
        <section className="feed__section">
          <div className="feed__section-header">
            <h3 className="feed__section-title">나의 학습</h3>
            <span className="feed__section-badge">{sessions.length}</span>
          </div>
          <div className="feed__list">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : sessions.length > 0 ? (
              sessions.slice(0, 3).map((item, i) => (
                <StudyCard key={item.id} item={item} onNavigate={onNavigate} onDelete={handleDelete} index={i} />
              ))
            ) : (
              <div className="feed__empty-inline">아직 학습 자료가 없습니다.</div>
            )}
            {sessions.length > 3 && !loading && (
              <button className="feed__more-btn" onClick={() => onNavigate('study')}>학습 전체 보기</button>
            )}
          </div>
        </section>

        {/* 나의 시험 */}
        <section className="feed__section">
          <div className="feed__section-header">
            <h3 className="feed__section-title">나의 시험</h3>
            <span className="feed__section-badge feed__section-badge--done">{exams.length}</span>
          </div>
          <div className="feed__list">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : exams.length > 0 ? (
              exams.slice(0, 3).map((item, i) => (
                <ExamCard key={item.id} item={item} onNavigate={onNavigate} onDelete={handleDeleteExam} index={i} />
              ))
            ) : (
              <div className="feed__empty-inline">아직 생성된 시험이 없습니다.</div>
            )}
            {exams.length > 3 && !loading && (
              <button className="feed__more-btn" onClick={() => onNavigate('exam')}>시험 전체 보기</button>
            )}
          </div>
        </section>
      </div>

    </div>
  );
};

export default MainFeed;
