-- Fix handle_new_user: workspace name can crash if email is null (LinkedIn OIDC)
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_workspace_id uuid;
  workspace_name   text;
begin
  -- Workspace name with fallbacks if email is null
  workspace_name := coalesce(
    nullif(split_part(new.email, '@', 1), ''),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    'Mon espace'
  );

  -- Créer un workspace par défaut
  insert into workspaces (name, created_by)
  values (workspace_name, new.id)
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
