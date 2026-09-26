create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  cpf text not null unique check (cpf ~ '^[0-9]{11}$'),
  profession text not null,
  registration_type text not null check (registration_type in ('CRM', 'CREF', 'CRN', 'COREN', 'CRP', 'CRF')),
  registration_number text not null,
  registration_state text not null check (registration_state in (
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  )),
  phone text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create or replace function public.is_valid_cpf(input_cpf text)
returns boolean
language plpgsql
immutable
strict
as $$
declare
  digit_index integer;
  weight integer;
  total integer;
  calculated_digit integer;
begin
  if input_cpf !~ '^[0-9]{11}$' or input_cpf ~ '^([0-9])\1{10}$' then
    return false;
  end if;

  for digit_index in 10..11 loop
    total := 0;
    for weight in 1..(digit_index - 1) loop
      total := total + substring(input_cpf, weight, 1)::integer * (digit_index + 1 - weight);
    end loop;
    calculated_digit := (total * 10) % 11;
    if calculated_digit = 10 then calculated_digit := 0; end if;
    if calculated_digit <> substring(input_cpf, digit_index, 1)::integer then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := new.raw_user_meta_data;
  expected_registration_type text;
begin
  expected_registration_type := case metadata ->> 'profession'
    when 'Médico(a) / Endocrinologista' then 'CRM'
    when 'Nutricionista' then 'CRN'
    when 'Educador(a) físico(a) / Personal trainer' then 'CREF'
    when 'Enfermeiro(a)' then 'COREN'
    when 'Psicólogo(a)' then 'CRP'
    when 'Farmacêutico(a)' then 'CRF'
    else null
  end;

  if not public.is_valid_cpf(metadata ->> 'cpf') then
    raise exception 'CPF inválido';
  end if;
  if expected_registration_type is null
    or metadata ->> 'registration_type' is distinct from expected_registration_type
    or coalesce(metadata ->> 'terms_accepted', 'false') <> 'true'
    or nullif(trim(metadata ->> 'full_name'), '') is null
    or nullif(trim(metadata ->> 'registration_number'), '') is null
    or coalesce(metadata ->> 'registration_state', '') not in (
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
      'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ) then
    raise exception 'Dados profissionais inválidos';
  end if;

  insert into public.profiles (
    id, full_name, cpf, profession, registration_type, registration_number,
    registration_state, phone, status
  ) values (
    new.id,
    trim(metadata ->> 'full_name'),
    metadata ->> 'cpf',
    metadata ->> 'profession',
    expected_registration_type,
    trim(metadata ->> 'registration_number'),
    metadata ->> 'registration_state',
    nullif(trim(metadata ->> 'phone'), ''),
    'pending'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Professionals can read their own profile" on public.profiles;
create policy "Professionals can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

revoke all on function public.is_valid_cpf(text) from public, anon, authenticated;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

-- Aprove manualmente pelo SQL Editor do Supabase:
-- update public.profiles set status = 'approved' where id = '<uuid-do-usuario>';