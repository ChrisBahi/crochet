-- Allow users to view a counterpart's opportunity when they have a match for it
-- (match rows now store opportunity_id = counterpart's opportunity)
drop policy if exists "opportunities_via_match" on opportunities;
create policy "opportunities_via_match" on opportunities
  for select using (
    exists (
      select 1
      from opportunity_matches om
      join workspace_members wm on wm.workspace_id = om.workspace_id and wm.user_id = auth.uid()
      where om.opportunity_id = opportunities.id
    )
  );
