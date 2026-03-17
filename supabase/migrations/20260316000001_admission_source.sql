-- Ajout du champ source pour tracking UTM / partenaires
alter table admission_requests
  add column if not exists source text;

comment on column admission_requests.source is 'UTM ref partenaire (ex: sowefund, kelly-massol, linkedin)';
