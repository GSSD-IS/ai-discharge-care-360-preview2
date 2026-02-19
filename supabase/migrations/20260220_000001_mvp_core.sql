-- MVP v0.1 core schema for single-hospital deployment
-- Scope: day1/day2 baseline (tables, constraints, indexes)

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  display_name text not null,
  role text not null check (role in ('case_manager', 'patient', 'family', 'external_org')),
  line_user_id text unique,
  contact_phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  patient_profile_id uuid not null references public.profiles(id) on delete restrict,
  current_state text not null check (current_state in ('S0', 'S1', 'S2', 'S3', 'S4', 'E1')),
  next_action text,
  due_at timestamptz,
  care_message text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_participants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  participant_type text not null check (participant_type in ('case_manager', 'patient', 'family', 'external_org')),
  is_primary boolean not null default false,
  contact_phone text,
  contact_note text,
  created_at timestamptz not null default now(),
  unique (case_id, profile_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  assigned_to_profile_id uuid not null references public.profiles(id) on delete restrict,
  task_type text not null check (task_type in ('contact_confirm', 'document_followup', 'org_coordination', 'care_reminder')),
  task_title text not null,
  task_detail text,
  status text not null default 'pending' check (status in ('pending', 'replied', 'done', 'overdue')),
  due_at timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_replies (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  replier_profile_id uuid not null references public.profiles(id) on delete restrict,
  reply_type text not null check (reply_type in ('done', 'need_help', 'contacted', 'cannot_do')),
  reply_text text,
  reply_channel text not null default 'line' check (reply_channel in ('line', 'web')),
  created_at timestamptz not null default now()
);

create table if not exists public.line_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  target_profile_id uuid not null references public.profiles(id) on delete restrict,
  message_type text not null check (message_type in ('progress', 'task', 'reminder', 'care')),
  template_key text not null,
  payload jsonb not null,
  line_message_id text,
  delivery_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  diff jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

create trigger trg_cases_updated_at
before update on public.cases
for each row
execute function public.set_updated_at();

create trigger trg_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create index if not exists idx_profiles_tenant_role on public.profiles (tenant_id, role);
create index if not exists idx_cases_tenant_state on public.cases (tenant_id, current_state);
create index if not exists idx_cases_due_at on public.cases (due_at);
create index if not exists idx_case_participants_case_type on public.case_participants (case_id, participant_type);
create index if not exists idx_tasks_case_status on public.tasks (case_id, status);
create index if not exists idx_tasks_assignee_due on public.tasks (assigned_to_profile_id, due_at);
create index if not exists idx_task_replies_task_created on public.task_replies (task_id, created_at desc);
create index if not exists idx_line_messages_target_created on public.line_messages (target_profile_id, created_at desc);
create index if not exists idx_audit_logs_tenant_created on public.audit_logs (tenant_id, created_at desc);
