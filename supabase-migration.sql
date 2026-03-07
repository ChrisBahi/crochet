-- ============================================================
-- CROCHET — Migration complète Supabase
-- Colle ce fichier dans Supabase > SQL Editor > Run
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── WORKSPACES ──────────────────────────────────────────────────
create table if not exists workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── USER SETTINGS ────────────────────────────────────────────────
create table if not exists user_settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  active_workspace_id  uuid references workspaces(id),
  created_at           timestamptz default now()
);

-- ── WORKSPACE MEMBERS ────────────────────────────────────────────
create table if not exists workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid references workspaces(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  role          text default 'member',
  p_score       numeric default 0,
  created_at    timestamptz default now(),
  unique(workspace_id, user_id)
);

-- ── INVESTOR PROFILES ────────────────────────────────────────────
create table if not exists investor_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id) on delete cascade unique,
  name                text,
  firm                text,
  role                text,
  country             text,
  email               text,
  ticket_min          bigint,
  ticket_max          bigint,
  sectors             text[] default '{}',
  geos                text[] default '{}',
  p_score             numeric default 0,
  verification_status text default 'unverified',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── OPPORTUNITIES ────────────────────────────────────────────────
create table if not exists opportunities (
  id             uuid primary key default uuid_generate_v4(),
  workspace_id   uuid references workspaces(id) on delete cascade,
  created_by     uuid references auth.users(id),
  title          text not null,
  description    text,
  sector         text,
  geo            text,
  deal_type      text,
  stage          text,
  status         text default 'draft',
  amount         bigint,
  valuation      bigint,
  revenue        bigint,
  pitch_deck_url text,
  website_url    text,
  signal         jsonb,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── OPPORTUNITY DECKS (MEMO + NDA) ──────────────────────────────
create table if not exists opportunity_decks (
  id              uuid primary key default uuid_generate_v4(),
  opportunity_id  uuid references opportunities(id) on delete cascade unique,
  summary         text,
  d_score         numeric,
  tags            text[] default '{}',
  status          text default 'pending',
  nda_text        text,
  nda_reference   text,
  nda_date        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── OPPORTUNITY MATCHES ──────────────────────────────────────────
create table if not exists opportunity_matches (
  id              uuid primary key default uuid_generate_v4(),
  workspace_id    uuid references workspaces(id) on delete cascade,
  opportunity_id  uuid references opportunities(id) on delete cascade,
  member_id       uuid references auth.users(id),
  fit_score       numeric default 0,
  ranking_score   numeric default 0,
  breakdown       jsonb,
  why             text[] default '{}',
  status          text default 'pending',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── ROOMS ────────────────────────────────────────────────────────
create table if not exists rooms (
  id              uuid primary key default uuid_generate_v4(),
  match_id        uuid references opportunity_matches(id),
  workspace_id    uuid references workspaces(id),
  opportunity_id  uuid references opportunities(id),
  status          text default 'active',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── MESSAGES ─────────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid references rooms(id) on delete cascade,
  sender_id   uuid references auth.users(id),
  created_by  uuid references auth.users(id),
  content     text not null,
  created_at  timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────────
create table if not exists notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  workspace_id  uuid references workspaces(id),
  type          text,
  title         text,
  body          text,
  link          text,
  read          boolean default false,
  created_at    timestamptz default now()
);

-- ── INDEXES ──────────────────────────────────────────────────────
create index if not exists idx_opportunities_workspace on opportunities(workspace_id);
create index if not exists idx_matches_workspace on opportunity_matches(workspace_id);
create index if not exists idx_matches_opportunity on opportunity_matches(opportunity_id);
create index if not exists idx_messages_room on messages(room_id);
create index if not exists idx_notifications_user on notifications(user_id, read);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────
alter table workspaces enable row level security;
alter table user_settings enable row level security;
alter table workspace_members enable row level security;
alter table investor_profiles enable row level security;
alter table opportunities enable row level security;
alter table opportunity_decks enable row level security;
alter table opportunity_matches enable row level security;
alter table rooms enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- Policies : chaque user voit ses propres données
create policy if not exists "user_settings_self" on user_settings
  for all using (auth.uid() = user_id);

create policy if not exists "investor_profiles_self" on investor_profiles
  for all using (auth.uid() = user_id);

create policy if not exists "notifications_self" on notifications
  for all using (auth.uid() = user_id);

-- Workspaces : créateur + membres
create policy if not exists "workspaces_member" on workspaces
  for select using (
    auth.uid() = created_by or
    exists (select 1 from workspace_members where workspace_id = workspaces.id and user_id = auth.uid())
  );

-- Opportunities : membres du workspace
create policy if not exists "opportunities_workspace" on opportunities
  for all using (
    auth.uid() = created_by or
    exists (select 1 from workspace_members where workspace_id = opportunities.workspace_id and user_id = auth.uid())
  );

-- Decks : lié à l'opportunity
create policy if not exists "decks_via_opportunity" on opportunity_decks
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = opportunity_decks.opportunity_id
      and (o.created_by = auth.uid() or
           exists (select 1 from workspace_members where workspace_id = o.workspace_id and user_id = auth.uid()))
    )
  );

-- Matches : membres du workspace
create policy if not exists "matches_workspace" on opportunity_matches
  for all using (
    auth.uid() = member_id or
    exists (select 1 from workspace_members where workspace_id = opportunity_matches.workspace_id and user_id = auth.uid())
  );

-- Rooms : via workspace
create policy if not exists "rooms_workspace" on rooms
  for all using (
    exists (select 1 from workspace_members where workspace_id = rooms.workspace_id and user_id = auth.uid())
  );

-- Messages : via room → workspace
create policy if not exists "messages_room" on messages
  for all using (
    auth.uid() = sender_id or
    exists (
      select 1 from rooms r
      join workspace_members wm on wm.workspace_id = r.workspace_id
      where r.id = messages.room_id and wm.user_id = auth.uid()
    )
  );

-- ── AUTO-CRÉER user_settings + workspace à l'inscription ────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_workspace_id uuid;
begin
  -- Créer un workspace par défaut
  insert into workspaces (name, created_by)
  values (split_part(new.email, '@', 1), new.id)
  returning id into new_workspace_id;

  -- Ajouter comme membre owner
  insert into workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  -- Créer les user_settings
  insert into user_settings (user_id, active_workspace_id)
  values (new.id, new_workspace_id);

  -- Créer un profil vide
  insert into investor_profiles (user_id, email)
  values (new.id, new.email);

  return new;
end;
$$;

-- Trigger sur la création d'un utilisateur
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
