-- Promote all existing 'draft' opportunities to 'active'
-- so they are picked up by the match engine.
-- Going forward, new opportunities are created with status='active' directly.
update opportunities
set status = 'active'
where status = 'draft';
