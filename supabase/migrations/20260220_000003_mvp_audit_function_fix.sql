-- Hotfix: make audit trigger function work on tables without direct tenant_id
-- Root cause: accessing new.tenant_id on tables like tasks/task_replies raises 42703

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
  j_new jsonb;
  j_old jsonb;
begin
  j_new := to_jsonb(new);
  j_old := to_jsonb(old);

  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_target_id := nullif(j_new->>'id', '')::uuid;
    v_tenant_id := nullif(j_new->>'tenant_id', '')::uuid;
    v_diff := jsonb_build_object('after', j_new);
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_target_id := nullif(j_new->>'id', '')::uuid;
    v_tenant_id := coalesce(
      nullif(j_new->>'tenant_id', '')::uuid,
      nullif(j_old->>'tenant_id', '')::uuid
    );
    v_diff := jsonb_build_object('before', j_old, 'after', j_new);
  elsif tg_op = 'DELETE' then
    v_action := 'delete';
    v_target_id := nullif(j_old->>'id', '')::uuid;
    v_tenant_id := nullif(j_old->>'tenant_id', '')::uuid;
    v_diff := jsonb_build_object('before', j_old);
  end if;

  -- tables without direct tenant_id: derive from case relation
  if v_tenant_id is null and tg_table_name = 'tasks' then
    if tg_op = 'DELETE' then
      select c.tenant_id into v_tenant_id
      from public.cases c
      where c.id = old.case_id;
    else
      select c.tenant_id into v_tenant_id
      from public.cases c
      where c.id = new.case_id;
    end if;
  elsif v_tenant_id is null and tg_table_name = 'task_replies' then
    if tg_op = 'DELETE' then
      select c.tenant_id into v_tenant_id
      from public.tasks t
      join public.cases c on c.id = t.case_id
      where t.id = old.task_id;
    else
      select c.tenant_id into v_tenant_id
      from public.tasks t
      join public.cases c on c.id = t.case_id
      where t.id = new.task_id;
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
