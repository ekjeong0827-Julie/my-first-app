import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ onNavigate, onAddSummary }) => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert('파일을 먼저 등록해주세요.');
    if (!category) return alert('카테고리를 선택해주세요.');
    
    setIsUploading(true);
    // Mock upload
    setTimeout(() => {
      setIsUploading(false);
      
      const fileTitle = file.name.replace(/\.[^/.]+$/, "");
      if (onAddSummary) {
        onAddSummary({
          tags: [category],
          title: fileTitle,
          summary: '방금 등록하신 자료를 AI가 분석하여 도출한 핵심 요약입니다.',
          date: '방금 전'
        });
      }

      alert('자료 등록 및 요약 정리가 완료되었습니다!');
      onNavigate('home');
    }, 1000);
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">시험 자료 등록</h1>
        <p className="upload-subtitle">공부할 자료(PDF, DOCX)를 올려주시면 AI가 중점내용을 요약해드립니다.</p>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
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

        <button 
          type="submit" 
          className={`submit-btn ${isUploading ? 'loading' : ''}`}
          disabled={isUploading}
        >
          {isUploading ? '요약 정리 중...' : '자료 등록 및 시작하기'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
