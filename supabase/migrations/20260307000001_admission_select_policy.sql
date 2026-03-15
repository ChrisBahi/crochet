-- Permet à un utilisateur authentifié de lire sa propre candidature (par email)
drop policy if exists "admission_requests_select_own" on admission_requests;
create policy "admission_requests_select_own" on admission_requests
  for select using (email = auth.email());
