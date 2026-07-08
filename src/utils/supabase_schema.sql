-- Create quotes table
create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  body_text text,
  author text,
  bg_image_url text,
  is_predefined_background boolean default false,
  user_id uuid references auth.users(id)
);

-- Enable RLS for quotes
alter table public.quotes enable row level security;
create policy "Quotes are viewable by everyone" on public.quotes for select using (true);
create policy "Users can insert quotes" on public.quotes for insert with check (auth.role() = 'authenticated');

-- Create likes table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  quote_id uuid references public.quotes(id) not null,
  unique(user_id, quote_id)
);

-- Enable RLS for likes
alter table public.likes enable row level security;
create policy "Users can read likes" on public.likes for select using (true);
create policy "Users can insert likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete likes" on public.likes for delete using (auth.uid() = user_id);

-- Create profiles table (missing previously)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  email text,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
