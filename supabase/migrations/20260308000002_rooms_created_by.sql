-- Add created_by to rooms so a user can always access their own room
-- regardless of workspace membership (needed for demo rooms)

alter table rooms add column if not exists created_by uuid references auth.users(id);

-- Update the RLS policy to also allow the room creator
drop policy if exists "rooms_workspace" on rooms;
create policy "rooms_workspace" on rooms
  for all using (
    auth.uid() = created_by
    or exists (
      select 1 from workspace_members
      where workspace_id = rooms.workspace_id
        and user_id = auth.uid()
    )
  );
