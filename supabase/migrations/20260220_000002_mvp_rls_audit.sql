-- MVP v0.1 security baseline
-- Scope: RLS deny-by-default + role policies + audit triggers

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_participants enable row level security;
alter table public.tasks enable row level security;
alter table public.task_replies enable row level security;
alter table public.line_messages enable row level security;
alter table public.audit_logs enable row level security;

-- Helper functions for role and tenant checks
create or replace function public.current_profile_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_profile_tenant_id()
returns uuid
language sql
stable
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

-- PROFILES
create policy profiles_select_self
on public.profiles
for select
using (id = auth.uid());

create policy profiles_select_same_tenant_for_case_manager
on public.profiles
for select
using (
  public.current_profile_role() = 'case_manager'
  and tenant_id = public.current_profile_tenant_id()
);

-- CASES
create policy cases_select_participant
on public.cases
for select
using (
  exists (
    select 1
    from public.case_participants cp
    where cp.case_id = cases.id
      and cp.profile_id = auth.uid()
  )
);

create policy cases_manage_case_manager
on public.cases
for all
using (
  public.current_profile_role() = 'case_manager'
  and tenant_id = public.current_profile_tenant_id()
)
with check (
  public.current_profile_role() = 'case_manager'
  and tenant_id = public.current_profile_tenant_id()
);

-- CASE PARTICIPANTS
create policy participants_select_case_participant
on public.case_participants
for select
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.case_participants cp
    where cp.case_id = case_participants.case_id
      and cp.profile_id = auth.uid()
  )
);

create policy participants_manage_case_manager
on public.case_participants
for all
using (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.cases c
    where c.id = case_participants.case_id
      and c.tenant_id = public.current_profile_tenant_id()
  )
)
with check (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.cases c
    where c.id = case_participants.case_id
      and c.tenant_id = public.current_profile_tenant_id()
  )
);

-- TASKS
create policy tasks_select_assignee
on public.tasks
for select
using (assigned_to_profile_id = auth.uid());

create policy tasks_select_case_manager_same_tenant
on public.tasks
for select
using (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.cases c
    where c.id = tasks.case_id
      and c.tenant_id = public.current_profile_tenant_id()
  )
);

create policy tasks_manage_case_manager
on public.tasks
for all
using (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.cases c
    where c.id = tasks.case_id
      and c.tenant_id = public.current_profile_tenant_id()
  )
)
with check (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.cases c
    where c.id = tasks.case_id
      and c.tenant_id = public.current_profile_tenant_id()
  )
);

-- TASK REPLIES
create policy replies_select_assignee_or_replier
on public.task_replies
for select
using (
  replier_profile_id = auth.uid()
  or exists (
    select 1
    from public.tasks t
    where t.id = task_replies.task_id
      and t.assigned_to_profile_id = auth.uid()
  )
  or (
    public.current_profile_role() = 'case_manager'
    and exists (
      select 1
      from public.tasks t
      join public.cases c on c.id = t.case_id
      where t.id = task_replies.task_id
        and c.tenant_id = public.current_profile_tenant_id()
    )
  )
);

create policy replies_insert_assignee_self
on public.task_replies
for insert
with check (
  replier_profile_id = auth.uid()
  and exists (
    select 1
    from public.tasks t
    where t.id = task_replies.task_id
      and t.assigned_to_profile_id = auth.uid()
  )
);

create policy replies_insert_case_manager
on public.task_replies
for insert
with check (
  public.current_profile_role() = 'case_manager'
  and replier_profile_id = auth.uid()
  and exists (
    select 1
    from public.tasks t
    join public.cases c on c.id = t.case_id
    where t.id = task_replies.task_id
      and c.tenant_id = public.current_profile_tenant_id()
  )
);

-- LINE MESSAGES
create policy line_messages_select_target
on public.line_messages
for select
using (target_profile_id = auth.uid());

create policy line_messages_manage_case_manager
on public.line_messages
for all
using (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.profiles p
    where p.id = line_messages.target_profile_id
      and p.tenant_id = public.current_profile_tenant_id()
  )
)
with check (
  public.current_profile_role() = 'case_manager'
  and exists (
    select 1
    from public.profiles p
    where p.id = line_messages.target_profile_id
      and p.tenant_id = public.current_profile_tenant_id()
  )
);

-- AUDIT LOGS
create policy audit_select_case_manager
on public.audit_logs
for select
using (
  public.current_profile_role() = 'case_manager'
  and tenant_id = public.current_profile_tenant_id()
);

create policy audit_insert_service_or_case_manager
on public.audit_logs
for insert
with check (
  tenant_id = public.current_profile_tenant_id()
  and (
    actor_profile_id = auth.uid()
    or auth.role() = 'service_role'
  )
);

-- Audit trigger function
create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_target_id uuid;
  v_diff jsonb;
  v_action text;
begin
  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_target_id := new.id;
    v_tenant_id := coalesce(new.tenant_id, null);
    v_diff := jsonb_build_object('after', to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_target_id := new.id;
    v_tenant_id := coalesce(new.tenant_id, old.tenant_id, null);
    v_diff := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
  elsif tg_op = 'DELETE' then
    v_action := 'delete';
    v_target_id := old.id;
    v_tenant_id := coalesce(old.tenant_id, null);
    v_diff := jsonb_build_object('before', to_jsonb(old));
  end if;

  -- tables without direct tenant_id: derive from case relation when possible
  if v_tenant_id is null and tg_table_name in ('tasks', 'task_replies') then
    if tg_table_name = 'tasks' then
      select c.tenant_id into v_tenant_id
      from public.cases c
      where c.id = coalesce(new.case_id, old.case_id);
    elsif tg_table_name = 'task_replies' then
      select c.tenant_id into v_tenant_id
      from public.tasks t
      join public.cases c on c.id = t.case_id
      where t.id = coalesce(new.task_id, old.task_id);
    end if;
  end if;

  insert into public.audit_logs (
    tenant_id,
    actor_profile_id,
    action,
    target_table,
    target_id,
    diff,
    ip
  ) values (
    coalesce(v_tenant_id, '00000000-0000-0000-0000-000000000000'::uuid),
    auth.uid(),
    v_action,
    tg_table_name,
    v_target_id,
    v_diff,
    null
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_audit_cases on public.cases;
create trigger trg_audit_cases
after insert or update or delete on public.cases
for each row
execute function public.write_audit_log();

drop trigger if exists trg_audit_tasks on public.tasks;
create trigger trg_audit_tasks
after insert or update or delete on public.tasks
for each row
execute function public.write_audit_log();

drop trigger if exists trg_audit_task_replies on public.task_replies;
create trigger trg_audit_task_replies
after insert or update or delete on public.task_replies
for each row
execute function public.write_audit_log();
