-- exams 테이블 생성: 시험 정보 및 AI 생성 문항 저장
CREATE TABLE IF NOT EXISTS exams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  study_title text,
  study_id uuid REFERENCES study(id) ON DELETE CASCADE,
  question_count integer,
  question_type text,
  answer_mode text,
  status text DEFAULT 'pending',
  score integer,
  questions jsonb, -- AI가 생성한 문제 목록을 JSON 배열로 저장
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at_full text -- 사용자가 요청한 YYYYMMDDHHMMSS 형식
);

-- RLS 활성화 및 정책 설정
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON exams FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON exams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON exams FOR DELETE USING (true);
