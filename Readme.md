# Supabase Setup

1. Sign up at https://app.supabase.io and create a new project.
2. In the SQL editor, run the following to create `profiles` table:

```sql-- Users Table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password text not null,
  username text not null unique,
  coins integer default 0,
  created_at timestamp default current_timestamp
);

-- Tournaments Table
create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text not null,
  entry_fee integer not null,
  reward integer not null,
  match_time timestamp not null,
  max_players integer not null,
  status text default 'ON', -- 'ON' | 'END'
  winner_id uuid references users(id),
  created_at timestamp default current_timestamp
);

-- Tournament Participation Table
create table tournament_players (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamp default current_timestamp,
  reward_collected boolean default false,
  unique (tournament_id, user_id)
);

-- View to simplify status categorization (optional helper for frontend logic)
create view user_tournament_status as
select
  tp.user_id,
  t.id as tournament_id,
  t.title,
  t.status,
  t.winner_id,
  case
    when t.status = 'END' and t.winner_id = tp.user_id then 'won'
    when t.status = 'END' then 'completed'
    when t.status = 'ON' then 'ongoing'
  end as user_status
from tournament_players tp
join tournaments t on t.id = tp.tournament_id;```
