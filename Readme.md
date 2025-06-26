# Supabase Setup

1. Sign up at https://app.supabase.io and create a new project.
2. In the SQL editor, run the following to create `profiles` table:

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique not null,
  first_name text,
  last_name text,
  gender text check (gender in ('Male','Female')),
  coins integer default 0,
  avatar_url text,
  primary key (id)
);


https://im-h.phncdn.com/cDIuDou_vFSwhWEwmnT9wLmOPUU=,1750926723/hls/videos/202506/22/470720835/720P_4000K_470720835.mp4/master.m3u8?
