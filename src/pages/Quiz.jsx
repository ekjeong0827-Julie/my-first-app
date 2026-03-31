import React, { useState, useEffect, useRef } from 'react';
import './Quiz.css';

/* ─── 목 데이터 ─── */
const MOCK_QUESTIONS = [
  {
    id: 1,
    type: 'ox',
    question: '의열단은 1919년 김원봉의 주도 하에 만주 지린성에서 결성된 항일 무장단체이다.',
    answer: true,
    source: '1920년대 문화통치기 저항 단원 중, 의열단은 1919년 11월 김원봉이 만주 지린(吉林)에서 결성하였다. 폭력적 투쟁 방식을 채택하여 일제 요인 암살과 주요 시설 폭파를 주요 활동으로 삼았다.',
    sourceHighlight: '1919년 11월 김원봉이 만주 지린(吉林)에서 결성하였다.',
    keyword: '의열단 결성',
    references: [
      { title: '한국민족문화대백과사전 - 의열단', url: 'https://encykorea.aks.ac.kr/Contents/Item/E0043329' },
      { title: '우리역사넷 - 의열단 결성과 활동', url: 'http://contents.history.go.kr/mobile/nh/view.do?levelId=nh_043_0030_0010_0010' },
      { title: '독립기념관 - 의열투쟁의 전개', url: 'https://i815.or.kr/kor/content/contents.do?v_menu_code=01020202' }
    ]
  },
  {
    id: 2,
    type: 'mc4',
    question: '다음 중 3.1 운동(1919) 이후 일제의 통치 방식 변화로 옳은 것은?',
    options: [
      '헌병 경찰제를 유지하며 탄압 강화',
      '문화통치를 표방하며 보통 경찰제로 전환',
      '토지 조사 사업을 새롭게 시작',
      '조선총독에 문관 출신만 임명 허용',
    ],
    answer: 1,
    source: '3.1 운동 이후 일제는 기존의 헌병 경찰 제도가 보통 경찰 제도로 바꾸고, 이른바 "문화통치"를 표방하였다. 그러나 이는 표면적 유화책에 불과했으며, 오히려 경찰 수를 대폭 늘려 감시를 강화하였다.',
    sourceHighlight: '헌병 경찰 제도를 보통 경찰 제도로 바꾸고, "문화통치"를 표방하였다.',
    keyword: '문화통치',
    references: [
      { title: '국사편찬위원회 - 1920년대 문화통치', url: 'http://contents.history.go.kr/mobile/ni/view.do?levelId=ni_001_0010' },
      { title: '네이버 지식백과 - 문화통치', url: 'https://terms.naver.com/entry.naver?docId=1095116' },
      { title: '역사 에듀 - 일제의 통치 체제 변화', url: 'https://historyedu.co.kr/1920s-rule/' }
    ]
  },
  {
    id: 3,
    type: 'mc5',
    question: '봉오동 전투(1920)에서 일본군을 격파한 독립군 부대의 사령관으로 옳은 것은?',
    options: [
      '김좌진',
      '이범석',
      '홍범도',
      '안중근',
      '지청천',
    ],
    answer: 2,
    source: '봉오동 전투는 1920년 6월, 홍범도가 이끄는 대한독립군과 여러 독립군 연합 부대가 일본군 추격대를 봉오동 골짜기에 유인하여 대파한 전투이다. 이는 독립군의 첫 대규모 승리로 기록된다.',
    sourceHighlight: '홍범도가 이끄는 대한독립군이 일본군 추격대를 봉오동 골짜기에 유인하여 대파한 전투이다.',
    keyword: '봉오동 전투',
    references: [
      { title: '위키백과 - 봉오동 전투', url: 'https://ko.wikipedia.org/wiki/봉오동_전투' },
      { title: '홍범도 장군 기념사업회', url: 'http://www.hongbumdo.org/' },
      { title: '국가보훈부 - 이달의 독립운동가 홍범도', url: 'https://www.mpva.go.kr/mpva/contents/contentsView.do?mCode=MC04010100' }
    ]
  },
  {
    id: 4,
    type: 'mc4',
    question: '1940년 충칭에서 창설된 대한민국 임시정부의 정규 군사 조직은?',
    options: [
      '조선의용대',
      '한국광복군',
      '북로 군정서',
      '조선혁명군',
    ],
    answer: 1,
    source: '대한민국 임시정부는 1940년 충칭에서 한국광복군을 창설하였다. 지청천을 총사령관으로 임명하였으며, 미국 OSS와 협력하여 국내 진입 작전을 계획하였으나 광복으로 실현되지 못하였다.',
    sourceHighlight: '1940년 충칭에서 한국광복군을 창설하였다.',
    keyword: '한국광복군',
    references: [
      { title: '대한민국 임시정부 기념관', url: 'https://nmip.mpva.go.kr/' },
      { title: '한국광복군 창설과 활동 개요', url: 'http://contents.history.go.kr/mobile/nh/view.do?levelId=nh_044_0040_0010' },
      { title: '지식백과 - 한국광복군', url: 'https://terms.naver.com/entry.naver?docId=1161175' }
    ]
  },
  {
    id: 5,
    type: 'ox',
    question: '청산리 대첩(1920)은 김좌진이 지휘하는 북로군정서군이 주도한 전투이다.',
    answer: true,
    source: '청산리 대첩은 1920년 10월, 김좌진의 북로군정서와 홍범도의 대한독립군 등 연합 부대가 백두산 인근 청산리 일대에서 일본군과 벌인 전투이다. 6일간의 전투에서 대규모 독립군 승리로 기록된다.',
    sourceHighlight: '김좌진의 북로군정서와 홍범도의 대한독립군 등 연합 부대가 청산리 일대에서 일본군과 벌인 전투이다.',
    keyword: '청산리 대첩',
    references: [
      { title: '김좌진 장군 기념사업회', url: 'http://www.kimjwajin.org/' },
      { title: '청산리 대첩 요약 - 우리역사넷', url: 'http://contents.history.go.kr/mobile/nh/view.do?levelId=nh_043_0040_0010_0010' },
      { title: '나무위키 - 청산리 전투', url: 'https://namu.wiki/w/청산리 전투' }
    ]
  },
  {
    id: 6,
    type: 'short',
    question: '에빙하우스 망각곡선에 따르면, 학습 후 24시간이 지났을 때 기억 유지율은 약 몇 %인가? (숫자만 입력)',
    answer: '33',
    answerAlts: ['33%', '약 33', '약33'],
    source: '에빙하우스의 망각곡선 실험에 따르면, 학습 직후 100%였던 기억은 20분 후 약 58%, 1시간 후 약 44%, 24시간 후 약 33%로 떨어진다. 이를 극복하기 위한 전략이 간격 반복(Spaced Repetition)이다.',
    sourceHighlight: '24시간 후 약 33%로 떨어진다.',
    keyword: '망각곡선',
    references: [
      { title: '에빙하우스 망각곡선 이론 상세', url: 'https://en.wikipedia.org/wiki/Forgetting_curve' },
      { title: '기억력을 높이는 4단계 복습법', url: 'https://brunch.co.kr/@learning/12' },
      { title: '간격 반복 학습의 효과', url: 'https://fs.blog/spacing-effect/' }
    ]
  },
];

/* ─── 서브 컴포넌트: 진행 바 ─── */
const ProgressBar = ({ current, total }) => (
  <div className="quiz-progress">
    <div className="quiz-progress__info">
      <span className="quiz-progress__cur">{current}</span>
      <span className="quiz-progress__sep"> / </span>
      <span className="quiz-progress__tot">{total}</span>
      <span className="quiz-progress__lbl"> 문제</span>
    </div>
    <div className="quiz-progress__bar">
      <div
        className="quiz-progress__fill"
        style={{ width: `${((current - 1) / total) * 100}%` }}
      />
    </div>
  </div>
);

/* ─── 서브 컴포넌트: O/X 보기 ─── */
const OXOptions = ({ selected, onSelect, submitted }) => (
  <div className="ox-options">
    {[true, false].map(val => {
      const label = val ? 'O' : 'X';
      const cls = ['ox-btn'];
      if (selected === val) cls.push(val ? 'ox-btn--o' : 'ox-btn--x');
      if (submitted && selected === val) cls.push('no-hover');
      return (
        <button
          key={label}
          className={cls.join(' ')}
          onClick={() => !submitted && onSelect(val)}
          disabled={submitted}
        >
          {label}
        </button>
      );
    })}
  </div>
);

/* ─── 서브 컴포넌트: 객관식 보기 ─── */
const MCOptions = ({ options, selected, answer, onSelect, submitted }) => (
  <div className="mc-options">
    {options.map((opt, i) => {
      const cls = ['mc-btn'];
      if (submitted) {
        if (i === answer) cls.push('mc-btn--correct');
        else if (selected === i) cls.push('mc-btn--wrong');
      } else if (selected === i) {
        cls.push('mc-btn--selected');
      }
      return (
        <button
          key={i}
          className={cls.join(' ')}
          onClick={() => !submitted && onSelect(i)}
          disabled={submitted}
        >
          <span className="mc-btn__num">{i + 1}</span>
          <span className="mc-btn__text">{opt}</span>
          {submitted && i === answer && (
            <svg className="mc-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {submitted && selected === i && i !== answer && (
            <svg className="mc-btn__icon mc-btn__icon--x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </button>
      );
    })}
  </div>
);

/* ─── 서브 컴포넌트: 단답형 입력 ─── */
const ShortAnswer = ({ value, onChange, submitted }) => (
  <div className="short-wrap">
    <input
      className={`short-input ${submitted ? 'short-input--submitted' : ''}`}
      type="text"
      placeholder="정답을 입력하세요"
      value={value}
      onChange={e => !submitted && onChange(e.target.value)}
      disabled={submitted}
      autoComplete="off"
    />
  </div>
);

/* ─── 서브 컴포넌트: 정답 피드백 오버레이 ─── */
const FeedbackOverlay = ({ correct }) => (
  <div className={`feedback-overlay ${correct ? 'feedback-overlay--correct' : 'feedback-overlay--wrong'}`}>
    {correct ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    )}
  </div>
);

/* ─── 서브 컴포넌트: 오답 원문 패널 ─── */
const SourcePanel = ({ q }) => (
  <div className="source-panel animate-fade-up">
    <div className="source-panel__header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span>원문 근거 확인</span>
      <span className="source-panel__keyword">{q.keyword}</span>
    </div>
    <p className="source-panel__text">
      {q.source.split(q.sourceHighlight).map((part, i, arr) =>
        i < arr.length - 1
          ? [part, <mark key={i} className="source-highlight">{q.sourceHighlight}</mark>]
          : part
      )}
    </p>

    {q.references && q.references.length > 0 && (
      <>
        <div className="source-panel__divider" />
        <div className="source-panel__ref-title">참고내용</div>
        <div className="source-panel__links">
          {q.references.slice(0, 3).map((ref, idx) => (
            <a key={idx} href={ref.url} target="_blank" rel="noopener noreferrer" className="source-ref-link">
              <span className="source-ref-link__title">{ref.title}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
          ))}
        </div>
      </>
    )}
  </div>
);

/* ─── 메인 컴포넌트 ─── */
const Quiz = ({ onNavigate, examConfig }) => {
  const questions = MOCK_QUESTIONS;
  const total = questions.length;

  const [idx, setIdx]           = useState(0);
  const [selected, setSelected] = useState(null);   // O/X: bool | 객관식: number | 단답형: string
  const [shortVal, setShortVal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSource, setShowSource]     = useState(false);
  const [cardShake, setCardShake]       = useState(false);
  const [results, setResults]           = useState([]);   // { id, correct }
  const [quizDone, setQuizDone]         = useState(false);

  const q = questions[idx];
  const isPerQuestion = !examConfig || examConfig.answerMode !== 'after_all';

  // 정답 판정
  const judge = () => {
    let correct = false;
    if (q.type === 'ox') {
      correct = selected === q.answer;
    } else if (q.type === 'mc4' || q.type === 'mc5') {
      correct = selected === q.answer;
    } else if (q.type === 'short') {
      const cleaned = shortVal.trim().replace(/[%\s]/g, '').toLowerCase();
      correct = [q.answer, ...(q.answerAlts || [])].some(
        a => a.replace(/[%\s]/g, '').toLowerCase() === cleaned
      );
    }
    return correct;
  };

  const handleSubmit = () => {
    const val = q.type === 'short' ? shortVal : selected;
    if (val === null || val === '' || val === undefined) return;

    const correct = judge();
    setIsCorrect(correct);
    setSubmitted(true);
    setShowFeedback(true);
    setResults(prev => [...prev, { id: q.id, correct, keyword: q.keyword }]);

    if (!correct) {
      setCardShake(true);
      setTimeout(() => setCardShake(false), 500);
    }

    // 피드백 오버레이는 1초 후 사라짐
    setTimeout(() => {
      setShowFeedback(false);
      if (!correct && isPerQuestion) setShowSource(true);
    }, 900);
  };

  const handleNext = () => {
    if (idx + 1 >= total) {
      setQuizDone(true);
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setShortVal('');
      setSubmitted(false);
      setIsCorrect(null);
      setShowSource(false);
    }
  };

  // 퀴즈 완료 → 결과 요약 내부 렌더
  if (quizDone) {
    const correctCount = results.filter(r => r.correct).length;
    const score = Math.round((correctCount / total) * 100);
    const wrong = results.filter(r => !r.correct).map(r => r.keyword);
    return (
      <div className="quiz-result animate-fade-up">
        <div className="quiz-result__score-wrap">
          <div className="quiz-result__circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="result-ring__track"/>
              <circle
                cx="60" cy="60" r="50"
                className="result-ring__fill"
                strokeDasharray={`${314 * score / 100} 314`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="quiz-result__score">{score}</span>
            <span className="quiz-result__score-lbl">점</span>
          </div>
          <p className="quiz-result__msg">
            {score >= 90 ? '🏆 완벽합니다!' : score >= 70 ? '👍 훌륭해요!' : '💪 조금만 더!'}
          </p>
          <p className="quiz-result__sub">{total}문제 중 {correctCount}개 정답</p>
        </div>

        {wrong.length > 0 && (
          <div className="quiz-result__weak">
            <h3 className="quiz-result__weak-title">취약 키워드</h3>
            <div className="quiz-result__weak-list">
              {wrong.map((kw, i) => (
                <span key={i} className="quiz-result__weak-tag">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="quiz-result__actions">
          <button className="quiz-result__btn quiz-result__btn--ghost" onClick={() => {
            setIdx(0); setResults([]); setSelected(null); setShortVal('');
            setSubmitted(false); setIsCorrect(null); setShowSource(false); setQuizDone(false);
          }}>
            다시 풀기
          </button>
          <button className="quiz-result__btn quiz-result__btn--primary" onClick={() => onNavigate && onNavigate('home')}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = q.type === 'short'
    ? shortVal.trim().length > 0
    : selected !== null;

  return (
    <div className="quiz-page">
      {/* 헤더 */}
      <header className="quiz-header">
        <button className="quiz-back-btn" onClick={() => onNavigate && onNavigate('home')} aria-label="나가기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <ProgressBar current={idx + 1} total={total} />
        <div className="quiz-header__score">
          <span className="quiz-header__correct">{results.filter(r => r.correct).length}</span>
          <span className="quiz-header__sep">/</span>
          <span>{idx}</span>
        </div>
      </header>

      {/* 문제 카드 */}
      <div className="quiz-body">
        <div className={`quiz-card ${cardShake ? 'shake' : ''} ${submitted ? (isCorrect ? 'quiz-card--correct' : 'quiz-card--wrong') : ''}`}>
          {/* 문제 유형 배지 */}
          <div className="quiz-type-badge">
            {q.type === 'ox' && '⭕ O / X'}
            {q.type === 'mc4' && '📝 객관식 4지선다'}
            {q.type === 'mc5' && '📝 객관식 5지선다'}
            {q.type === 'short' && '✏️ 단답형'}
          </div>

          <p className="quiz-question">{q.question}</p>

          {/* 보기 */}
          <div className="quiz-options">
            {q.type === 'ox' && (
              <OXOptions
                selected={selected}
                onSelect={setSelected}
                submitted={submitted}
              />
            )}
            {(q.type === 'mc4' || q.type === 'mc5') && (
              <MCOptions
                options={q.options}
                selected={selected}
                answer={q.answer}
                onSelect={setSelected}
                submitted={submitted}
              />
            )}
            {q.type === 'short' && (
              <ShortAnswer
                value={shortVal}
                onChange={setShortVal}
                submitted={submitted}
              />
            )}
          </div>

          {/* 피드백 오버레이 */}
          {showFeedback && <FeedbackOverlay correct={isCorrect} />}
        </div>

        {/* 정답 후 결과 메시지 */}
        {submitted && !showFeedback && (
          <div className={`quiz-result-msg animate-fade-up ${isCorrect ? 'quiz-result-msg--correct' : 'quiz-result-msg--wrong'}`}>
            {isCorrect ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
                정답이에요! 🎉
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                아쉬워요! 원문을 확인해보세요
              </>
            )}
          </div>
        )}

        {/* 원문 역추적 패널 (오답 시) */}
        {showSource && !isCorrect && submitted && <SourcePanel q={q} />}
      </div>

      {/* 하단 CTA */}
      <div className="quiz-footer">
        {!submitted ? (
          <button
            className="quiz-cta"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            정답 확인
          </button>
        ) : (
          <button className="quiz-cta quiz-cta--next" onClick={handleNext}>
            {idx + 1 >= total ? '결과 보기 🏁' : '다음 문제'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
