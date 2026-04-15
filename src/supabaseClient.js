import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase 환경 변수가 설정되지 않았습니다.',
    'VITE_SUPABASE_URL:', supabaseUrl ? '설정됨' : '미설정',
    'VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '미설정'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
