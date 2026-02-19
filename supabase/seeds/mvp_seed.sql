-- MVP v0.1 seed data (single hospital, small roles)

begin;

-- Fixed IDs for deterministic local testing
with const as (
  select
    '11111111-1111-1111-1111-111111111111'::uuid as tenant_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as case_manager_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid as patient_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid as family_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid as external_org_id,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid as case_id,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid as task_id
)
insert into public.profiles (id, tenant_id, display_name, role, line_user_id, contact_phone)
select case_manager_id, tenant_id, '王個管師', 'case_manager', 'U_case_manager_demo', '0912000001' from const
union all
select patient_id, tenant_id, '張病患', 'patient', 'U_patient_demo', '0912000002' from const
union all
select family_id, tenant_id, '張家屬', 'family', 'U_family_demo', '0912000003' from const
union all
select external_org_id, tenant_id, '幸福居家護理所', 'external_org', 'U_org_demo', '0223456789' from const
on conflict (id) do nothing;

with const as (
  select
    '11111111-1111-1111-1111-111111111111'::uuid as tenant_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as case_manager_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid as patient_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid as family_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid as external_org_id,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid as case_id,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid as task_id
)
insert into public.cases (
  id,
  tenant_id,
  patient_profile_id,
  current_state,
  next_action,
  due_at,
  care_message,
  created_by
)
select
  case_id,
  tenant_id,
  patient_id,
  'S1',
  '請家屬確認出院後聯繫方式與外部機構窗口',
  now() + interval '36 hours',
  '我們會一路陪伴您完成出院準備，若有問題可直接回覆 need_help。',
  case_manager_id
from const
on conflict (id) do nothing;

with const as (
  select
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as case_manager_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid as patient_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid as family_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid as external_org_id,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid as case_id,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid as task_id
)
insert into public.case_participants (case_id, profile_id, participant_type, is_primary, contact_phone, contact_note)
select case_id, case_manager_id, 'case_manager', true, '0912000001', '主責窗口' from const
union all
select case_id, patient_id, 'patient', true, '0912000002', '病患本人' from const
union all
select case_id, family_id, 'family', true, '0912000003', '主要家屬' from const
union all
select case_id, external_org_id, 'external_org', true, '0223456789', '外部機構窗口' from const
on conflict (case_id, profile_id) do nothing;

with const as (
  select
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid as case_manager_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid as family_id,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid as case_id,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid as task_id
)
insert into public.tasks (
  id,
  case_id,
  assigned_to_profile_id,
  task_type,
  task_title,
  task_detail,
  status,
  due_at,
  created_by
)
select
  task_id,
  case_id,
  family_id,
  'contact_confirm',
  '請確認主要聯絡方式',
  '請回覆主要聯絡人姓名與可聯絡時段。',
  'pending',
  now() + interval '24 hours',
  case_manager_id
from const
on conflict (id) do nothing;

commit;
