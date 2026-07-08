-- Profiles table to extend auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  primary key (id)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Quotes table
create table public.quotes (
  id uuid default gen_random_uuid() primary key,
  bg_image_url text not null,
  body_text text, -- 'text' is a reserved keyword in some contexts, using body_text for clarity, or just text if preferred. Let's use "text" as requested but handled swiftly.
  author text,
  likes_count int default 0,
  created_at timestamptz default now()
);

-- Constraint: Author can exist only if text exists
alter table public.quotes
  add constraint check_author_requires_text
  check (
    (author is null) or (body_text is not null)
  );

-- Enable RLS on quotes
alter table public.quotes enable row level security;

-- Quotes policies
create policy "Quotes are viewable by everyone."
  on quotes for select
  using ( true );

-- Likes table
create table public.likes (
  user_id uuid references auth.users not null,
  quote_id uuid references public.quotes not null,
  created_at timestamptz default now(),
  primary key (user_id, quote_id)
);

-- Enable RLS on likes
alter table public.likes enable row level security;

-- Likes policies
create policy "Users can see their own likes"
  on likes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own likes"
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes"
  on likes for delete
  using ( auth.uid() = user_id );

-- Function to handle likes count
create or replace function public.handle_new_like()
returns trigger as $$
begin
  update public.quotes
  set likes_count = coalesce(likes_count, 0) + 1
  where id = new.quote_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_un_like()
returns trigger as $$
begin
  update public.quotes
  set likes_count = greatest(0, coalesce(likes_count, 0) - 1)
  where id = old.quote_id;
  return old;
end;
$$ language plpgsql security definer;

-- Triggers for likes count
create trigger on_like_created
  after insert on public.likes
  for each row execute procedure public.handle_new_like();

create trigger on_like_deleted
  after delete on public.likes
  for each row execute procedure public.handle_un_like();

-- Trigger to handle new user creation (optional but good for syncing profiles)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
