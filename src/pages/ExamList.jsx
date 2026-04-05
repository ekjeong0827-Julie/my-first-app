import React, { useState } from 'react';
import ExamCreate from './ExamCreate';
import './ExamList.css';

/* ── Mock study sessions (shared source of truth would come from context/state) ── */
export const STUDY_SESSIONS = [
  { id: 1, title: '2025학년도 수능 대비 한국사 핵심 요약', tags: ['한국사', '수능'] },
  { id: 2, title: '고3 모의고사 빈칸추론 유형 분석', tags: ['영어'] },
  { id: 3, title: '정보처리기사 실기 - 데이터베이스 핵심', tags: ['자격증', 'CS'] },
];

/* ── Mock exam list ── */
const INITIAL_EXAMS = [
  {
    id: 1,
    title: '한국사 핵심 시험 1회',
    studyTitle: '2025학년도 수능 대비 한국사 핵심 요약',
    questionCount: 30,
    questionType: '객관식 5지선다',
    answerMode: '다 풀고 채점',
    createdAt: '2026-03-30',
    status: 'pending',   // pending | done
    score: null,
  },
  {
    id: 2,
    title: '영어 빈칸추론 완성 시험',
    studyTitle: '고3 모의고사 빈칸추론 유형 분석',
    questionCount: 20,
    questionType: '객관식 4지선다',
    answerMode: '문제마다 확인',
    createdAt: '2026-03-28',
    status: 'done',
    score: 85,
  },
];

const STATUS_MAP = {
  pending: { label: '미응시', color: 'var(--primary)', bg: 'var(--primary-light)' },
  done:    { label: '완료',   color: 'var(--success)', bg: 'var(--success-bg)' },
};

const ExamCard = ({ exam, onStart, index }) => {
  const s = STATUS_MAP[exam.status];
  return (
    <div className="exam-card animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="exam-card__header">
        <div className="exam-card__meta-row">
          <span className="exam-card__status-badge" style={{ color: s.color, background: s.bg }}>
            {s.label}
          </span>
          <span className="exam-card__date">{exam.createdAt}</span>
        </div>
        {exam.score !== null && (
          <span
            className="exam-card__score"
            style={{ color: exam.score >= 80 ? 'var(--success)' : 'var(--danger)' }}
          >
            {exam.score}점
          </span>
        )}
      </div>

      <h3 className="exam-card__title">{exam.title}</h3>
      <p className="exam-card__study-ref">📚 {exam.studyTitle}</p>

      <div className="exam-card__chips">
        <span className="exam-chip">{exam.questionCount}문제</span>
        <span className="exam-chip">{exam.questionType}</span>
        <span className="exam-chip">{exam.answerMode}</span>
      </div>

      <div className="exam-card__actions">
        {exam.status === 'done' ? (
          <>
            <button className="exam-btn exam-btn--ghost" onClick={() => onStart(exam, 'retry')}>
              다시 풀기
            </button>
            <button className="exam-btn exam-btn--primary" onClick={() => onStart(exam, 'review')}>
              오답 복습
            </button>
          </>
        ) : (
          <button className="exam-btn exam-btn--primary exam-btn--full" onClick={() => onStart(exam, 'start')}>
            시험 시작
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const ExamList = ({ onNavigate }) => {
  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('savedExams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (newExam) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    const newExamWithMeta = { 
      ...newExam, 
      id: Date.now(),
      createdAtFull: timestamp // User requested YYYYMMDDHHMMSS
    };
    
    const updated = [newExamWithMeta, ...exams];
    setExams(updated);
    localStorage.setItem('savedExams', JSON.stringify(updated));
    setShowCreate(false);
    
    alert(`시험이 생성되었습니다!\n생성일시: ${timestamp}`);
  };

  const pending = exams.filter(e => e.status === 'pending');
  const done    = exams.filter(e => e.status === 'done');

  return (
    <>
      <div className="exam-list">
        {/* Header */}
        <header className="exam-list__header">
          <div className="exam-list__header-top">
            <div>
              <p className="exam-list__label">내 시험 관리</p>
              <h1 className="exam-list__title">시험 목록</h1>
            </div>
            <button className="exam-list__create-btn" onClick={() => setShowCreate(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              시험 만들기
            </button>
          </div>
          <div className="exam-list__summary">
            <div className="exam-summary-pill">
              <span className="exam-summary-pill__num">{exams.length}</span>
              <span className="exam-summary-pill__lbl">전체</span>
            </div>
            <div className="exam-summary-pill exam-summary-pill--pending">
              <span className="exam-summary-pill__num">{pending.length}</span>
              <span className="exam-summary-pill__lbl">미응시</span>
            </div>
            <div className="exam-summary-pill exam-summary-pill--done">
              <span className="exam-summary-pill__num">{done.length}</span>
              <span className="exam-summary-pill__lbl">완료</span>
            </div>
          </div>
        </header>

        <div className="exam-list__body">
          {/* Pending exams */}
          {pending.length > 0 && (
            <section className="exam-section">
              <div className="exam-section__head">
                <h2 className="exam-section__title">응시 예정</h2>
                <span className="exam-section__count">{pending.length}</span>
              </div>
              {pending.map((exam, i) => (
                <ExamCard key={exam.id} exam={exam} onStart={(e, mode) => onNavigate('quiz', e.id)} index={i} />
              ))}
            </section>
          )}

          {/* Done exams */}
          {done.length > 0 && (
            <section className="exam-section">
              <div className="exam-section__head">
                <h2 className="exam-section__title">완료된 시험</h2>
                <span className="exam-section__count exam-section__count--done">{done.length}</span>
              </div>
              {done.map((exam, i) => (
                <ExamCard key={exam.id} exam={exam} onStart={(e, mode) => onNavigate('quiz', e.id)} index={i} />
              ))}
            </section>
          )}

          {exams.length === 0 && (
            <div className="exam-empty animate-fade-up">
              <div className="exam-empty__icon">📋</div>
              <h3>아직 만든 시험이 없어요</h3>
              <p>학습 자료를 기반으로 시험을 만들어보세요!</p>
              <button className="exam-btn exam-btn--primary" onClick={() => setShowCreate(true)}>
                첫 시험 만들기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create exam sheet */}
      {showCreate && (
        <ExamCreate
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          studySessions={STUDY_SESSIONS}
        />
      )}
    </>
  );
};

export default ExamList;
