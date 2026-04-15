import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { generateSummary } from '../aiService';
import './FileUpload.css';

const FileUpload = ({ onNavigate, onAddSummary }) => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialName.trim()) return alert('학습자료명을 입력해주세요.');
    if (!category) return alert('카테고리를 선택해주세요.');
    if (!file) return alert('파일을 먼저 등록해주세요.');
    
    setIsUploading(true);

    try {
      // 1. AI 연결 중
      setStatus('AI 엔진에 연결 중...');
      setProgress(20);
      await new Promise(res => setTimeout(res, 800)); // 시각적 효과를 위한 지연

      // 2. 학습자료 전달 중
      setStatus('학습자료 전달 중...');
      setProgress(40);
      await new Promise(res => setTimeout(res, 800));

      // 3. 요약 분석 중
      setStatus('핵심 내용 요약 분석 중...');
      setProgress(70);
      const aiSummary = await generateSummary(materialName.trim(), category);

      // 4. 저장 및 완료
      setStatus('분석 결과 저장 및 완료 중...');
      setProgress(90);
      const { error } = await supabase
        .from('study')
        .insert([
          {
            study_name: materialName.trim(),
            category: category,
            filename: file.name,
            summary: aiSummary
          }
        ]);

      if (error) throw error;
      
      setProgress(100);
      setStatus('요약 결과 완료!');
      await new Promise(res => setTimeout(res, 500));
      
      onNavigate('home');
    } catch (error) {
      console.error('Error in processing:', error);
      alert('처리에 실패했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
      setStatus('');
      setProgress(0);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">학습자료 등록</h1>
        <p className="upload-subtitle">공부할 자료(PDF, DOCX)를 올려주시면 AI가 중점내용을 요약해드립니다.</p>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">학습자료명</label>
          <input 
            type="text"
            className="form-input"
            value={materialName}
            onChange={e => setMaterialName(e.target.value)}
            placeholder="자료의 이름을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">카테고리 선택</label>
          <select 
            className="form-select" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>과목이나 주제를 선택하세요</option>
            <option value="수능/모의고사">수능/모의고사</option>
            <option value="내신 대비">내신 대비</option>
            <option value="자격증 시험">자격증 시험</option>
            <option value="어학 시험">어학 시험</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">파일 업로드</label>
          <div 
            className={`dropzone ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input 
              type="file" 
              id="fileInput" 
              className="file-input-hidden" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            {file ? (
              <div className="file-info">
                <svg className="file-icon" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div className="dropzone-content">
                <div className="upload-icon-wrapper">
                  <svg className="upload-icon" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                </div>
                <div className="dropzone-text">
                  <span className="text-primary">클릭하여 파일 선택</span> 또는 여기로 드래그하세요
                </div>
                <div className="dropzone-hint">PDF, DOCX, TXT (최대 10MB)</div>
              </div>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="progress-overlay">
            <span className="status-text">{status}</span>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className={`submit-btn ${isUploading ? 'loading' : ''}`}
          disabled={isUploading}
        >
          {isUploading ? '분석 중...' : '자료 등록 및 시작하기'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
