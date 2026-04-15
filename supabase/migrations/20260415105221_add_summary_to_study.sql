-- study 테이블에 요약 정보를 저장할 summary 컬럼 추가
ALTER TABLE study ADD COLUMN IF NOT EXISTS summary text;
