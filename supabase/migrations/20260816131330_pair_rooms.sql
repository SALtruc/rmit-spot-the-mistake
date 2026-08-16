-- Pair Comparison rooms. Players authenticate anonymously, so no RMIT ID or
-- other onboarding data is stored in this feature.
create table public.pair_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique check (room_code ~ '^[0-9]{5}$'),
  document_mode text not null check (document_mode in ('cv', 'linkedin', 'interview')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.pair_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.pair_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  avatar smallint not null default 0 check (avatar between 0 and 5),
  progress jsonb not null default '{}'::jsonb,
  score integer not null default 0 check (score >= 0),
  is_complete boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create index pair_participants_room_id_idx on public.pair_participants (room_id);
create index pair_participants_user_id_idx on public.pair_participants (user_id);

alter table public.pair_rooms enable row level security;
alter table public.pair_participants enable row level security;

create schema if not exists private;

-- This helper is deliberately kept outside the Data API. It avoids recursive
-- RLS checks when a player reads another participant in the same room.
create or replace function private.is_pair_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pair_participants participant
    where participant.room_id = target_room_id
      and participant.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_pair_member(uuid) from public;
grant execute on function private.is_pair_member(uuid) to authenticated;

create policy "Pair members can read their room"
on public.pair_rooms for select to authenticated
using (
  created_by = (select auth.uid())
  or (select private.is_pair_member(id))
);

create policy "Pair members can read participants in their room"
on public.pair_participants for select to authenticated
using ((select private.is_pair_member(room_id)));

create policy "Players can update only their own progress"
on public.pair_participants for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- The room code is intentionally the invitation mechanism. Both RPCs run as
-- SECURITY DEFINER so a player can join by a code before RLS grants room read
-- access. They validate every input, use auth.uid(), and cannot exceed 2 seats.
create or replace function public.create_pair_room(
  p_document_mode text,
  p_display_name text,
  p_avatar smallint default 0
)
returns table (room_id uuid, room_code text, document_mode text, participant_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_room public.pair_rooms%rowtype;
  new_participant public.pair_participants%rowtype;
  generated_code text;
  attempt integer := 0;
begin
  if current_user_id is null then
    raise exception 'Sign in anonymously before creating a room.';
  end if;

  if p_document_mode not in ('cv', 'linkedin', 'interview') then
    raise exception 'Choose a valid document mode.';
  end if;

  if char_length(trim(coalesce(p_display_name, ''))) not between 1 and 32 then
    raise exception 'Enter a name between 1 and 32 characters.';
  end if;

  if coalesce(p_avatar, 0) not between 0 and 5 then
    raise exception 'Choose a valid avatar.';
  end if;

  loop
    attempt := attempt + 1;
    generated_code := lpad((floor(10000 + random() * 90000))::integer::text, 5, '0');
    begin
      insert into public.pair_rooms (room_code, document_mode, created_by)
      values (generated_code, p_document_mode, current_user_id)
      returning * into new_room;
      exit;
    exception when unique_violation then
      if attempt >= 5 then
        raise exception 'Could not generate a unique room code. Please try again.';
      end if;
    end;
  end loop;

  insert into public.pair_participants (room_id, user_id, display_name, avatar)
  values (new_room.id, current_user_id, trim(p_display_name), coalesce(p_avatar, 0))
  returning * into new_participant;

  return query select new_room.id, new_room.room_code, new_room.document_mode, new_participant.id;
end;
$$;

create or replace function public.join_pair_room(
  p_room_code text,
  p_display_name text,
  p_avatar smallint default 0
)
returns table (room_id uuid, room_code text, document_mode text, participant_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  joined_room public.pair_rooms%rowtype;
  joined_participant public.pair_participants%rowtype;
begin
  if current_user_id is null then
    raise exception 'Sign in anonymously before joining a room.';
  end if;

  if trim(coalesce(p_room_code, '')) !~ '^[0-9]{5}$' then
    raise exception 'Enter a 5-digit invitation code.';
  end if;

  if char_length(trim(coalesce(p_display_name, ''))) not between 1 and 32 then
    raise exception 'Enter a name between 1 and 32 characters.';
  end if;

  if coalesce(p_avatar, 0) not between 0 and 5 then
    raise exception 'Choose a valid avatar.';
  end if;

  select * into joined_room
  from public.pair_rooms room
  where room.room_code = trim(p_room_code)
  for update;

  if not found then
    raise exception 'That invitation code does not match a room.';
  end if;

  select * into joined_participant
  from public.pair_participants participant
  where participant.room_id = joined_room.id
    and participant.user_id = current_user_id;

  if found then
    return query select joined_room.id, joined_room.room_code, joined_room.document_mode, joined_participant.id;
    return;
  end if;

  if (select count(*) from public.pair_participants participant where participant.room_id = joined_room.id) >= 2 then
    raise exception 'This room already has two players.';
  end if;

  insert into public.pair_participants (room_id, user_id, display_name, avatar)
  values (joined_room.id, current_user_id, trim(p_display_name), coalesce(p_avatar, 0))
  returning * into joined_participant;

  return query select joined_room.id, joined_room.room_code, joined_room.document_mode, joined_participant.id;
end;
$$;

revoke all on function public.create_pair_room(text, text, smallint) from public, anon;
revoke all on function public.join_pair_room(text, text, smallint) from public, anon;
grant execute on function public.create_pair_room(text, text, smallint) to authenticated;
grant execute on function public.join_pair_room(text, text, smallint) to authenticated;

grant select on public.pair_rooms to authenticated;
grant select on public.pair_participants to authenticated;
grant update (progress, score, is_complete, updated_at) on public.pair_participants to authenticated;

alter publication supabase_realtime add table public.pair_participants;
