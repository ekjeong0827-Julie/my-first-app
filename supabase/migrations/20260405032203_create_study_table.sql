CREATE TABLE IF NOT EXISTS study (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  study_name text NOT NULL,
  category text,
  filename text,
  uploadfile text,
  createtime timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  owner uuid
);

-- RLS (Row Level Security) 활성화 (보안 모범 사례)
ALTER TABLE study ENABLE ROW LEVEL SECURITY;

-- 누구나 읽을 수 있는 정책
CREATE POLICY "Enable read access for all users"
ON study FOR SELECT
USING (true);

-- 누구나 데이터를 추가할 수 있는 정책
CREATE POLICY "Enable insert access for all users"
ON study FOR INSERT
WITH CHECK (true);

-- 누구나 데이터를 수정할 수 있는 정책
CREATE POLICY "Enable update access for all users"
ON study FOR UPDATE
USING (true)
WITH CHECK (true);

-- 누구나 데이터를 삭제할 수 있는 정책
CREATE POLICY "Enable delete access for all users"
ON study FOR DELETE
USING (true);
