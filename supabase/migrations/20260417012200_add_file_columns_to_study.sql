-- study 테이블에 원본 파일과 MIME 타입을 저장할 컬럼 추가
ALTER TABLE study ADD COLUMN IF NOT EXISTS file_content text;
ALTER TABLE study ADD COLUMN IF NOT EXISTS mime_type text;
