-- Create followers table
create table if not exists followers (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Add RLS policies
alter table followers enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own followers" on followers;
drop policy if exists "Users can view who they follow" on followers;
drop policy if exists "Users can follow others" on followers;
drop policy if exists "Users can unfollow others" on followers;
drop policy if exists "Anyone can view followers" on followers;
drop policy if exists "Authenticated users can follow others" on followers;

-- Allow anyone to view followers/following data
create policy "Anyone can view followers"
  on followers for select
  using (true);

-- Allow authenticated users to follow others
create policy "Authenticated users can follow others"
  on followers for insert
  with check (
    auth.role() = 'authenticated' 
    and auth.uid() = follower_id
    and follower_id != following_id
  );

-- Allow users to unfollow others
create policy "Users can unfollow others"
  on followers for delete
  using (auth.uid() = follower_id);

-- Create function to get follower count
create or replace function get_follower_count(user_id uuid)
returns integer as $$
begin
  return (
    select count(*)
    from followers
    where following_id = user_id
  );
end;
$$ language plpgsql security definer;

-- Create function to get following count
create or replace function get_following_count(user_id uuid)
returns integer as $$
begin
  return (
    select count(*)
    from followers
    where follower_id = user_id
  );
end;
$$ language plpgsql security definer; 