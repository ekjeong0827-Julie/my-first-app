import React, { useState, useEffect } from 'react';
import './ExamCreate.css';

const QUESTION_COUNTS = [20, 25, 30, 50, 100, 200];

const QUESTION_TYPES = [
  { id: 'mc5', label: '객관식 5지선다', desc: '5개 보기 중 1개 선택' },
  { id: 'mc4', label: '객관식 4지선다', desc: '4개 보기 중 1개 선택' },
  { id: 'mixed', label: '주관식 포함', desc: '객관식 + 단답형 혼합' },
];

const ANSWER_MODES = [
  {
    id: 'per_question',
    label: '문제마다 확인',
    desc: '답 제출 즉시 정오 확인 및 해설 제공',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    id: 'after_all',
    label: '다 풀고 채점',
    desc: '모든 문제 풀이 후 한꺼번에 채점',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
];

const StepIndicator = ({ current, total }) => (
  <div className="step-indicator">
    {Array.from({ length: total }, (_, i) => (
      <span key={i} className={`step-dot ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}`} />
    ))}
  </div>
);

const ExamCreate = ({ onClose, onCreate, studySessions = [] }) => {
  const [step, setStep] = useState(0); // 0~3
  const [form, setForm] = useState({
    studyId: null,
    questionCount: 30,
    questionType: 'mc5',
    answerMode: 'per_question',
    title: '',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 300);
  };

  const canProceed = () => {
    if (step === 0) return !!form.studyId;
    if (step === 1) return !!form.questionCount;
    if (step === 2) return !!form.questionType;
    if (step === 3) return !!form.answerMode;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else handleClose();
  };

  const handleSubmit = () => {
    const selectedStudy = studySessions.find(s => s.id === form.studyId);
    const typeLabel = QUESTION_TYPES.find(t => t.id === form.questionType)?.label ?? '';
    const modeLabel = ANSWER_MODES.find(m => m.id === form.answerMode)?.label ?? '';
    const examTitle = form.title.trim()
      || `${selectedStudy?.tags?.[0] ?? '시험'} ${form.questionCount}문제 시험`;

    onCreate({
      title: examTitle,
      studyTitle: selectedStudy?.title ?? '',
      studyId: form.studyId,
      questionCount: form.questionCount,
      questionType: typeLabel,
      answerMode: modeLabel,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      score: null,
    });
    setMounted(false);
  };

  const STEPS = ['학습 선택', '문제 수', '문제 유형', '답변보기'];

  return (
    <div className={`ec-overlay ${mounted ? 'ec-overlay--in' : ''}`} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`ec-sheet ${mounted ? 'ec-sheet--in' : ''}`}>
        {/* Handle */}
        <div className="ec-handle" />

        {/* Header */}
        <div className="ec-header">
          <button className="ec-back-btn" onClick={handleBack} aria-label="뒤로">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="ec-header__center">
            <h2 className="ec-header__title">시험 만들기</h2>
            <p className="ec-header__sub">{STEPS[step]}</p>
          </div>
          <button className="ec-close-btn" onClick={handleClose} aria-label="닫기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <StepIndicator current={step} total={4} />

        {/* Content */}
        <div className="ec-body">

          {/* ── STEP 0: 학습 선택 ── */}
          {step === 0 && (
            <div className="ec-step animate-fade-up">
              <p className="ec-step__desc">어떤 학습 자료로 시험을 만들까요?</p>
              <div className="ec-study-list">
                {studySessions.map(session => (
                  <button
                    key={session.id}
                    className={`ec-study-item ${form.studyId === session.id ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, studyId: session.id }))}
                  >
                    <span className="ec-study-item__tags">
                      {session.tags.map(t => (
                        <span key={t} className="ec-mini-tag">{t}</span>
                      ))}
                    </span>
                    <span className="ec-study-item__title">{session.title}</span>
                    <span className="ec-study-item__check">
                      {form.studyId === session.id && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom title (optional) */}
              <div className="ec-field">
                <label className="ec-label">시험 이름 (선택)</label>
                <input
                  className="ec-input"
                  type="text"
                  placeholder="예: 기말고사 대비 한국사 1회"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={40}
                />
              </div>
            </div>
          )}

          {/* ── STEP 1: 문제 수 ── */}
          {step === 1 && (
            <div className="ec-step animate-fade-up">
              <p className="ec-step__desc">몇 문제로 시험을 구성할까요?</p>
              <div className="ec-count-grid">
                {QUESTION_COUNTS.map(count => (
                  <button
                    key={count}
                    className={`ec-count-btn ${form.questionCount === count ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, questionCount: count }))}
                  >
                    <span className="ec-count-btn__num">{count}</span>
                    <span className="ec-count-btn__lbl">문제</span>
                  </button>
                ))}
              </div>
              <p className="ec-hint">
                💡 20~30문제: 자투리 시간 학습 / 50문제 이상: 실전 모의고사
              </p>
            </div>
          )}

          {/* ── STEP 2: 문제 유형 ── */}
          {step === 2 && (
            <div className="ec-step animate-fade-up">
              <p className="ec-step__desc">어떤 유형의 문제를 출제할까요?</p>
              <div className="ec-type-list">
                {QUESTION_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`ec-type-card ${form.questionType === type.id ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, questionType: type.id }))}
                  >
                    <div className="ec-type-card__text">
                      <span className="ec-type-card__label">{type.label}</span>
                      <span className="ec-type-card__desc">{type.desc}</span>
                    </div>
                    <span className="ec-type-card__radio">
                      {form.questionType === type.id && <span className="ec-radio-dot" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: 답변보기 ── */}
          {step === 3 && (
            <div className="ec-step animate-fade-up">
              <p className="ec-step__desc">정답은 언제 확인할까요?</p>
              <div className="ec-mode-list">
                {ANSWER_MODES.map(mode => (
                  <button
                    key={mode.id}
                    className={`ec-mode-card ${form.answerMode === mode.id ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, answerMode: mode.id }))}
                  >
                    <span className="ec-mode-card__icon">{mode.icon}</span>
                    <div className="ec-mode-card__text">
                      <span className="ec-mode-card__label">{mode.label}</span>
                      <span className="ec-mode-card__desc">{mode.desc}</span>
                    </div>
                    {form.answerMode === mode.id && (
                      <svg className="ec-mode-card__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Summary preview */}
              <div className="ec-preview">
                <h4 className="ec-preview__title">시험 구성 요약</h4>
                <div className="ec-preview__rows">
                  <div className="ec-preview__row">
                    <span>학습 자료</span>
                    <strong>{studySessions.find(s => s.id === form.studyId)?.title}</strong>
                  </div>
                  <div className="ec-preview__row">
                    <span>문제 수</span>
                    <strong>{form.questionCount}문제</strong>
                  </div>
                  <div className="ec-preview__row">
                    <span>유형</span>
                    <strong>{QUESTION_TYPES.find(t => t.id === form.questionType)?.label}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="ec-footer">
          <button
            className="ec-cta"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === 3 ? '시험 생성하기 🎯' : '다음'}
            {step < 3 && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCreate;
