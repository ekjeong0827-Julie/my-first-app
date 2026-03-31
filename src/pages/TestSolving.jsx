import React, { useState, useEffect } from 'react';
import './TestSolving.css';

// Generate mock questions to simulate taking a test
const generateMockQuestions = (count) => {
  return Array.from({ length: Math.min(count, 10) }).map((_, i) => { // Cap at 10 to avoid too much scrolling for demo
    const isSubjective = Math.random() > 0.8; // 20% chance of being subjective if it were real, but we stick to options for ease.
    
    // We'll create standard 4-option mock questions
    return {
      id: i + 1,
      text: `문항 ${i + 1}. 이 자료에서 다루는 핵심 개념 중 가장 올바른 설명은 무엇인가요?`,
      options: [
        'AI가 분석한 오답 선택지 1번입니다.',
        '문맥상 전혀 관련이 없는 선택지 2번입니다.',
        '본문에서 강조한 정답과 일치하는 선택지 3번입니다.',
        '일부만 맞고 결론이 틀린 선택지 4번입니다.'
      ],
      correctIndex: 2 // always 3rd option for demo, or Math.floor(Math.random() * 4)
    };
  });
};

const TestSolving = ({ activeTest, onNavigate }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }

  useEffect(() => {
    if (activeTest) {
      setQuestions(generateMockQuestions(activeTest.questionCount || 5));
    }
  }, [activeTest]);

  if (!activeTest) {
    return <div>오류: 선택된 시험이 없습니다.</div>;
  }

  const handleSelectOption = (qId, optionIndex) => {
    if (answers[qId] !== undefined) return; // Prevent changing answer
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  return (
    <div className="solve-container">
      <div className="solve-header">
        <h1 className="solve-title">{activeTest.title}</h1>
        <p className="solve-subtitle">
          총 {activeTest.questionCount}문제 중 {questions.length}문제가 시뮬레이션으로 제공됩니다.
        </p>
      </div>

      <div className="question-list">
        {questions.map((q) => {
          const userUnanswered = answers[q.id] === undefined;
          const userSelected = answers[q.id];
          const isCorrect = userSelected === q.correctIndex;

          return (
            <div key={q.id} className="question-card">
              <h3 className="question-text">{q.text}</h3>
              <div className="options-list">
                {q.options.map((opt, idx) => {
                  let btnClass = 'option-btn';
                  
                  if (!userUnanswered) {
                    if (idx === userSelected && isCorrect) btnClass += ' selected-correct';
                    else if (idx === userSelected && !isCorrect) btnClass += ' selected-wrong';
                    else if (idx === q.correctIndex && !isCorrect) btnClass += ' correct-reveal';
                  }

                  return (
                    <button 
                      key={idx}
                      className={btnClass}
                      onClick={() => handleSelectOption(q.id, idx)}
                      disabled={!userUnanswered}
                    >
                      {idx + 1}. {opt}
                    </button>
                  );
                })}
              </div>

              {!userUnanswered && (
                <div className={`feedback-msg ${isCorrect ? 'correct' : 'wrong'}`}>
                  {isCorrect ? 'Good job 🎉' : 'Sorry!!! 😢'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="finish-btn" onClick={() => onNavigate('mytests')}>
        시험 종료하고 나가기
      </button>
    </div>
  );
};

export default TestSolving;
