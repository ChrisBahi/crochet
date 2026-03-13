-- Add AI analysis columns to admission_requests
alter table admission_requests
  add column if not exists ai_score  integer,   -- 0-100
  add column if not exists ai_note   text;      -- justification IA
