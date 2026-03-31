import React, { useState } from 'react';
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

const StudyCard = ({ item, onNavigate, index }) => {
  const isCompleted = item.progress === 100;
  return (
    <div
      className={`study-card animate-fade-up ${isCompleted ? 'study-card--done' : ''}`}
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
          {item.score !== null && (
            <span className="study-card__score" style={{ color: item.score >= 80 ? 'var(--success)' : 'var(--danger)' }}>
              {item.score}점
            </span>
          )}
        </div>
        <button
          className="study-card__cta"
          onClick={e => {
            e.stopPropagation();
            onNavigate && onNavigate(isCompleted ? 'mytests' : 'summary_detail', item.id);
          }}
        >
          {isCompleted ? '다시 풀기' : '이어 학습'}
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

const MainFeed = ({ summaries, onNavigate }) => {
  const sessions = STUDY_SESSIONS_DATA;
  const ongoing = sessions.filter(s => s.progress < 100);
  const completed = sessions.filter(s => s.progress === 100);
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

        {/* Ongoing */}
        {ongoing.length > 0 && (
          <section className="feed__section">
            <div className="feed__section-header">
              <h2 className="feed__section-title">진행 중인 학습</h2>
              <span className="feed__section-badge">{ongoing.length}</span>
            </div>
            {ongoing.map((item, i) => (
              <StudyCard key={item.id} item={item} onNavigate={onNavigate} index={i} />
            ))}
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section className="feed__section">
            <div className="feed__section-header">
              <h2 className="feed__section-title">완료된 학습</h2>
              <span className="feed__section-badge feed__section-badge--done">{completed.length}</span>
            </div>
            {completed.map((item, i) => (
              <StudyCard key={item.id} item={item} onNavigate={onNavigate} index={i} />
            ))}
          </section>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="feed__empty animate-fade-up">
            <div className="feed__empty-icon">📚</div>
            <h3>아직 학습 자료가 없어요</h3>
            <p>아래 + 버튼을 눌러 첫 학습을 시작해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainFeed;
