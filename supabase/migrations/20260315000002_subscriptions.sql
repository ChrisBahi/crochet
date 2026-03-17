-- Subscriptions table for Stripe billing
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null default 'trial', -- 'trial' | 'starter' | 'pro' | 'scale'
  status text not null default 'active', -- 'active' | 'canceled' | 'past_due' | 'expired'
  trial_ends_at timestamptz default (now() + interval '14 days'),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

-- Users can only read their own subscription
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service role can insert/update (via webhook)
create policy "subscriptions_service_all"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- Auto-create trial subscription on signup
create or replace function public.create_trial_subscription()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan, status, trial_ends_at)
  values (new.id, 'trial', 'active', now() + interval '14 days')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.create_trial_subscription();
