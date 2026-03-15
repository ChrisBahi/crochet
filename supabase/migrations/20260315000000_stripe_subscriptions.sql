-- ============================================================
-- CROCHET — Stripe subscription fields on workspaces
-- ============================================================

alter table workspaces
  add column if not exists stripe_customer_id      text unique,
  add column if not exists stripe_subscription_id  text unique,
  add column if not exists stripe_price_id         text,
  add column if not exists subscription_status     text default 'inactive',
  add column if not exists trial_ends_at           timestamptz,
  add column if not exists current_period_end      timestamptz;

create index if not exists idx_workspaces_stripe_customer on workspaces(stripe_customer_id);
create index if not exists idx_workspaces_stripe_sub     on workspaces(stripe_subscription_id);
