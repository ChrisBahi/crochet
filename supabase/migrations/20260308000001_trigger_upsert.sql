-- Trigger robuste : ON CONFLICT DO NOTHING pour éviter les doublons
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_workspace_id uuid;
  workspace_name   text;
begin
  workspace_name := coalesce(
    nullif(split_part(new.email, '@', 1), ''),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    'Mon espace'
  );

  insert into workspaces (name, created_by)
  values (workspace_name, new.id)
  on conflict do nothing
  returning id into new_workspace_id;

  -- Si workspace existait déjà, on le récupère
  if new_workspace_id is null then
    select id into new_workspace_id
    from workspaces
    where created_by = new.id
    limit 1;
  end if;

  if new_workspace_id is not null then
    insert into workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, new.id, 'owner')
    on conflict do nothing;

    insert into user_settings (user_id, active_workspace_id)
    values (new.id, new_workspace_id)
    on conflict do nothing;
  end if;

  insert into investor_profiles (user_id, email)
  values (new.id, new.email)
  on conflict do nothing;

  return new;
end;
$$;
