-- NDA Signatures: track who has signed each NDA
create table if not exists nda_signatures (
  id            uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  nda_reference text,
  signed_at     timestamptz not null default now(),
  unique(opportunity_id, user_id)
);

alter table nda_signatures enable row level security;

-- Users can sign and view signatures for opportunities they have access to
create policy "Users can insert their own signature"
  on nda_signatures for insert
  with check (auth.uid() = user_id);

create policy "Users can view all signatures"
  on nda_signatures for select
  using (true);
