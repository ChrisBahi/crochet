-- Migration : colonnes qualification supplémentaires (Q4 + Q5 par tunnel)
-- A appliquer dans Supabase > SQL Editor > Run

alter table admission_requests
  add column if not exists employees_range  text, -- cédants : nb salariés
  add column if not exists financial_health text, -- cédants : santé financière
  add column if not exists target_sectors   text, -- repreneurs : secteurs cibles
  add column if not exists acq_budget       text, -- repreneurs : budget acquisition
  add column if not exists investment_type  text, -- fonds : type investissement
  add column if not exists aum_range        text; -- fonds : AUM géré
