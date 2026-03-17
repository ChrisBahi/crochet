-- Dispatch IA : tunnel de qualification au signup
alter table admission_requests
  add column if not exists tunnel       text,   -- 'cedant' | 'repreneur' | 'fonds'
  add column if not exists intent_size  text,   -- taille d'entreprise visée
  add column if not exists intent_horizon text; -- horizon de temps

comment on column admission_requests.tunnel          is 'Tunnel assigné : cedant | repreneur | fonds';
comment on column admission_requests.intent_size     is 'Taille entreprise visée (question 2 qualification)';
comment on column admission_requests.intent_horizon  is 'Horizon de temps (question 3 qualification)';
