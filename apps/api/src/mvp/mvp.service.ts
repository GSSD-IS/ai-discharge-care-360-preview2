import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddCaseParticipantDto,
  CreateCaseDto,
  CreateTaskDto,
  CreateTaskReplyDto,
  UpdateCaseStateDto,
} from './dto/mvp.dto';

type CaseRow = {
  id: string;
  tenant_id: string;
  patient_profile_id: string;
  current_state: string;
  next_action: string | null;
  due_at: Date | null;
  care_message: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
};

type TaskRow = {
  id: string;
  case_id: string;
  assigned_to_profile_id: string;
  task_type: string;
  task_title: string;
  task_detail: string | null;
  status: string;
  due_at: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class MvpService {
  constructor(private readonly prisma: PrismaService) {}

  async createCase(dto: CreateCaseDto) {
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : null;

    const rows = await this.prisma.$queryRaw<CaseRow[]>(Prisma.sql`
      insert into public.cases (
        tenant_id,
        patient_profile_id,
        current_state,
        next_action,
        due_at,
        care_message,
        created_by
      ) values (
        ${dto.tenantId}::uuid,
        ${dto.patientProfileId}::uuid,
        ${dto.currentState},
        ${dto.nextAction ?? null},
        ${dueAt},
        ${dto.careMessage ?? null},
        ${dto.createdBy}::uuid
      )
      returning *
    `);

    return rows[0];
  }

  async addCaseParticipant(caseId: string, dto: AddCaseParticipantDto) {
    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      insert into public.case_participants (
        case_id,
        profile_id,
        participant_type,
        is_primary,
        contact_phone,
        contact_note
      ) values (
        ${caseId}::uuid,
        ${dto.profileId}::uuid,
        ${dto.participantType},
        ${dto.isPrimary ?? false},
        ${dto.contactPhone ?? null},
        ${dto.contactNote ?? null}
      )
      on conflict (case_id, profile_id)
      do update set
        participant_type = excluded.participant_type,
        is_primary = excluded.is_primary,
        contact_phone = excluded.contact_phone,
        contact_note = excluded.contact_note
      returning *
    `);

    return rows[0];
  }

  async updateCaseState(caseId: string, dto: UpdateCaseStateDto) {
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : null;

    const rows = await this.prisma.$queryRaw<CaseRow[]>(Prisma.sql`
      update public.cases
      set
        current_state = ${dto.currentState},
        next_action = ${dto.nextAction ?? null},
        due_at = ${dueAt},
        care_message = ${dto.careMessage ?? null}
      where id = ${caseId}::uuid
      returning *
    `);

    if (!rows[0]) {
      throw new NotFoundException('Case not found');
    }

    return rows[0];
  }

  async getCaseSummary(caseId: string) {
    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      select
        c.id,
        c.current_state as "currentState",
        c.next_action as "nextAction",
        c.due_at as "dueAt",
        c.care_message as "careMessage",
        cm.display_name as "caseManagerName",
        coalesce(cp.contact_phone, cm.contact_phone) as "caseManagerPhone"
      from public.cases c
      left join public.case_participants cp
        on cp.case_id = c.id
        and cp.participant_type = 'case_manager'
        and cp.is_primary = true
      left join public.profiles cm
        on cm.id = cp.profile_id
      where c.id = ${caseId}::uuid
      limit 1
    `);

    if (!rows[0]) {
      throw new NotFoundException('Case not found');
    }

    return rows[0];
  }

  async createTask(dto: CreateTaskDto) {
    const rows = await this.prisma.$queryRaw<TaskRow[]>(Prisma.sql`
      insert into public.tasks (
        case_id,
        assigned_to_profile_id,
        task_type,
        task_title,
        task_detail,
        status,
        due_at,
        created_by
      ) values (
        ${dto.caseId}::uuid,
        ${dto.assignedToProfileId}::uuid,
        ${dto.taskType},
        ${dto.taskTitle},
        ${dto.taskDetail ?? null},
        'pending',
        ${new Date(dto.dueAt)},
        ${dto.createdBy}::uuid
      )
      returning *
    `);

    return rows[0];
  }

  async getMyTasks(profileId: string) {
    return this.prisma.$queryRaw<TaskRow[]>(Prisma.sql`
      select *
      from public.tasks
      where assigned_to_profile_id = ${profileId}::uuid
      order by due_at asc
    `);
  }

  async createTaskReply(taskId: string, dto: CreateTaskReplyDto) {
    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      insert into public.task_replies (
        task_id,
        replier_profile_id,
        reply_type,
        reply_text,
        reply_channel
      ) values (
        ${taskId}::uuid,
        ${dto.replierProfileId}::uuid,
        ${dto.replyType},
        ${dto.replyText ?? null},
        ${dto.replyChannel ?? 'line'}
      )
      returning *
    `);

    if (!rows[0]) {
      throw new NotFoundException('Task reply failed');
    }

    const nextStatus = dto.replyType === 'done' ? 'done' : 'replied';
    await this.prisma.$executeRaw(Prisma.sql`
      update public.tasks
      set status = ${nextStatus}
      where id = ${taskId}::uuid
    `);

    return rows[0];
  }
}
