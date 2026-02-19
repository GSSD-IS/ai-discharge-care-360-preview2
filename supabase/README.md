# Supabase Schema (MVP v0.1)

This folder contains SQL for the LINE collaboration MVP.

## Files
- `migrations/20260220_000001_mvp_core.sql`: Core tables, constraints, triggers, indexes.
- `migrations/20260220_000002_mvp_rls_audit.sql`: RLS baseline policies and audit triggers.
- `migrations/20260220_000003_mvp_audit_function_fix.sql`: Fix audit trigger function for tables without `tenant_id`.
- `seeds/mvp_seed.sql`: Seed data for single-hospital MVP testing.

## Apply order
1. Run migration SQL.
2. Run RLS/audit migration SQL.
3. Run audit function hotfix SQL.
4. Run seed SQL.

## Notes
- Contact fields are currently plaintext and should be encrypted in a later hardening step.
