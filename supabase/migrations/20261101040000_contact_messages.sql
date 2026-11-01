-- Contact form messages: anyone can send (through the RPC only), only admins can read.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  company text check (char_length(company) <= 160),
  role text check (char_length(role) <= 120),
  message text not null check (char_length(message) between 1 and 5000),
  user_id uuid,
  handled boolean not null default false
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant select, update (handled) on public.contact_messages to authenticated;
create policy "contact admin read" on public.contact_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));
create policy "contact admin update" on public.contact_messages for update to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));
create index if not exists contact_messages_email_time on public.contact_messages (lower(email), created_at desc);

create or replace function public.submit_contact(_name text, _email text, _company text, _role text, _message text)
returns boolean language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(_email));
begin
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Please enter a valid email address'; end if;
  if (select count(*) from contact_messages where lower(email) = e and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from contact_messages where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Too many messages. Please try again later';
  end if;
  insert into contact_messages(name, email, company, role, message, user_id)
  values (left(trim(_name),120), e, nullif(left(trim(_company),160),''), nullif(left(trim(_role),120),''), left(trim(_message),5000), auth.uid());
  return true;
end $$;
revoke all on function public.submit_contact(text,text,text,text,text) from public;
grant execute on function public.submit_contact(text,text,text,text,text) to anon, authenticated;
