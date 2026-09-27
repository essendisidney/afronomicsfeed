-- One stored vintage per indicator, country, date and source.
-- Revisions with a different value remain new rows only when the value changes;
-- the application skips an exact repeat.

create unique index if not exists indicator_observations_vintage_idx
  on public.indicator_observations (indicator_id, country_id, observation_date, source_id, value);
