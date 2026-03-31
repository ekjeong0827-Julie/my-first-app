import React, { useState } from 'react';
import './TestGeneration.css';

const MOCK_CATEGORIES = ['한국사', '영어', '수학', '과학', '국어', '윤리', '내신 대비', '수능/모의고사', '자격증 시험', '어학 시험', '기타'];

const TestGeneration = ({ onNavigate, prefilledCategory, onAddTest }) => {
  const [selectedCategories, setSelectedCategories] = useState(
    prefilledCategory ? [prefilledCategory] : []
  );
  const [questionType, setQuestionType] = useState('객관식');
  const [optionType, setOptionType] = useState('4지선다');
  const [answerView, setAnswerView] = useState('바로보기');
  const [questionCount, setQuestionCount] = useState(20);
  const [testName, setTestName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerate = () => {
    if (selectedCategories.length === 0) {
      return alert('카테고리를 최소 1개 이상 선택해주세요.');
    }
    if (!testName.trim()) {
      return alert('시험명을 입력해 주세요.');
    }

    setIsGenerating(true);
    // Mock generation delay
    setTimeout(() => {
      setIsGenerating(false);
      
      if (onAddTest) {
        onAddTest({
          title: testName,
          questionCount: questionCount,
          categories: selectedCategories,
          date: '방금 전',
          status: '미응시'
        });
      }

      alert(`[${testName}] 문제 생성이 완료되었습니다!\n(내 시험지 페이지로 이동합니다.)`);
      if (onNavigate) onNavigate('mytests'); // Switch to the new tab
    }, 1000);
  };

  return (
    <div className="test-gen-container">
      <div className="test-gen-header">
        <h1 className="test-gen-title">시험 생성</h1>
        <p className="test-gen-subtitle">요약된 자료들을 바탕으로 원하는 설정의 응용문제를 만들어봅니다.</p>
      </div>

      <div className="section">
        <div className="section-title">카테고리 선택 (다중선택)</div>
        <div className="tag-cloud">
          {MOCK_CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`tag-btn ${selectedCategories.includes(cat) ? 'selected' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">문제 유형</div>
        <div className="option-group">
          <button 
            className={`option-btn ${questionType === '객관식' ? 'selected' : ''}`}
            onClick={() => setQuestionType('객관식')}
          >
            객관식만
          </button>
          <button 
            className={`option-btn ${questionType === '주관식 포함' ? 'selected' : ''}`}
            onClick={() => setQuestionType('주관식 포함')}
          >
            주관식 포함
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">지문 유형</div>
        <div className="option-group">
          <button 
            className={`option-btn ${optionType === '4지선다' ? 'selected' : ''}`}
            onClick={() => setOptionType('4지선다')}
          >
            4지선다
          </button>
          <button 
            className={`option-btn ${optionType === '5지선다' ? 'selected' : ''}`}
            onClick={() => setOptionType('5지선다')}
          >
            5지선다
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">답변 보기</div>
        <div className="option-group">
          <button 
            className={`option-btn ${answerView === '바로보기' ? 'selected' : ''}`}
            onClick={() => setAnswerView('바로보기')}
          >
            바로보기
          </button>
          <button 
            className={`option-btn ${answerView === '몰아보기' ? 'selected' : ''}`}
            onClick={() => setAnswerView('몰아보기')}
          >
            몰아보기
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">문항수</div>
        <div className="option-group">
          {[20, 30, 50, 100, 200].map(count => (
            <button 
              key={count}
              className={`option-btn ${questionCount === count ? 'selected' : ''}`}
              onClick={() => setQuestionCount(count)}
            >
              {count}문제
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">시험명 입력</div>
        <input 
          type="text" 
          className="form-input" 
          style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', outline: 'none' }}
          value={testName} 
          onChange={(e) => setTestName(e.target.value)} 
          placeholder="예: 2025 시험대비 모의고사 1회" 
        />
      </div>

      <button 
        className={`generate-btn ${isGenerating ? 'loading' : ''}`}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? '선택하신 옵션으로 문제 굽는 중...' : '시험 문제 생성하기'}
      </button>
    </div>
  );
};

export default TestGeneration;
