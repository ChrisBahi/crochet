-- Tracking des emails drip onboarding par utilisateur
alter table public.subscriptions
  add column if not exists drip_j1_sent_at timestamptz,
  add column if not exists drip_j3_sent_at timestamptz,
  add column if not exists drip_j7_sent_at timestamptz;

comment on column public.subscriptions.drip_j1_sent_at is 'Email drip J+1 envoyé le';
comment on column public.subscriptions.drip_j3_sent_at is 'Email drip J+3 envoyé le';
comment on column public.subscriptions.drip_j7_sent_at is 'Email drip J+7 envoyé le';
