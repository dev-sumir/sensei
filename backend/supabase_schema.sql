-- Supabase SQL schema for Sensie

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles
  enable row level security;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  storage_path text not null,
  status text not null default 'processing',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists conversations_user_document_idx
  on conversations(user_id, document_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create extension if not exists vector;

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  chunk_text text not null,
  embedding vector(768) not null
);

alter table documents
  enable row level security;

alter table conversations
  enable row level security;

alter table messages
  enable row level security;

alter table document_chunks
  enable row level security;

create policy \"Users can manage their documents\"
  on documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy \"Users can manage their profile\"
  on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy \"Users can manage their conversations\"
  on conversations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy \"Users can view their messages\"
  on messages
  for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy \"Users can insert messages in their conversations\"
  on messages
  for insert
  with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy \"Users can view chunks of their documents\"
  on document_chunks
  for select
  using (
    exists (
      select 1 from documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

