import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddCaseParticipantDto,
  CreateCaseDto,
  CreateTaskDto,
  CreateTaskReplyDto,
  LineWebhookDto,
  SendProgressNotificationDto,
  SendTaskNotificationDto,
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

type ProfileLineRow = {
  id: string;
  line_user_id: string | null;
};

type LineReplyParsed = {
  taskId?: string;
  replyType?: 'done' | 'need_help' | 'contacted' | 'cannot_do';
  replyText?: string;
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

  async sendProgressNotification(dto: SendProgressNotificationDto) {
    const text = this.buildProgressText(dto);
    return this.sendLineText({
      caseId: dto.caseId,
      targetProfileId: dto.targetProfileId,
      messageType: 'progress',
      templateKey: 'progress_v1',
      payload: dto,
      text,
    });
  }

  async sendTaskNotification(dto: SendTaskNotificationDto) {
    const text = this.buildTaskText(dto);
    return this.sendLineText({
      caseId: dto.caseId,
      targetProfileId: dto.targetProfileId,
      messageType: 'task',
      templateKey: 'task_v1',
      payload: dto,
      text,
    });
  }

  async handleLineWebhook(rawBody: string, signature: string | undefined, body: LineWebhookDto) {
    const strictSig = process.env.LINE_SIGNATURE_STRICT === 'true';
    const signatureOk = this.verifyLineSignature(rawBody, signature);

    if (strictSig && !signatureOk) {
      return { ok: false, message: 'invalid signature' };
    }

    let processed = 0;
    let skipped = 0;

    for (const event of body.events || []) {
      const eventType = String((event as any).type || '');
      if (eventType !== 'message') {
        skipped++;
        continue;
      }

      const lineUserId = String((event as any).source?.userId || '');
      const text = String((event as any).message?.text || '').trim();
      if (!lineUserId || !text) {
        skipped++;
        continue;
      }

      const profile = await this.getProfileByLineUserId(lineUserId);
      if (!profile) {
        skipped++;
        continue;
      }

      const parsed = this.parseLineReplyText(text);
      if (!parsed.replyType) {
        skipped++;
        continue;
      }

      const taskId = parsed.taskId ?? (await this.getLatestPendingTaskId(profile.id));
      if (!taskId) {
        skipped++;
        continue;
      }

      await this.createTaskReply(taskId, {
        replierProfileId: profile.id,
        replyType: parsed.replyType,
        replyText: parsed.replyText,
        replyChannel: 'line',
      });

      processed++;
    }

    return { ok: true, signatureOk, processed, skipped };
  }

  private buildProgressText(dto: SendProgressNotificationDto): string {
    const due = dto.dueAt ? new Date(dto.dueAt).toLocaleString('zh-TW') : '未設定';
    const mgr = dto.caseManagerName || '個管師';
    const phone = dto.caseManagerPhone || '請由院方回覆';
    const care = dto.careMessage || '我們會持續陪伴您完成每一步，請安心。';

    return [
      '【出院進度更新】',
      `目前進度：${dto.currentState}`,
      `下一步：${dto.nextAction}`,
      `截止時間：${due}`,
      `聯絡窗口：${mgr} / ${phone}`,
      `關懷：${care}`,
    ].join('\n');
  }

  private buildTaskText(dto: SendTaskNotificationDto): string {
    const due = dto.dueAt ? new Date(dto.dueAt).toLocaleString('zh-TW') : '未設定';
    const care = dto.careMessage || '若需要協助，請直接回覆 need_help。';

    return [
      '【待辦任務提醒】',
      `任務：${dto.taskTitle}`,
      `內容：${dto.taskDetail || '請依照院方指示完成回覆。'}`,
      `截止時間：${due}`,
      '回覆選項：done / need_help / contacted / cannot_do',
      `關懷：${care}`,
      dto.taskId ? `任務代碼：${dto.taskId}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private async sendLineText(input: {
    caseId?: string;
    targetProfileId: string;
    messageType: 'progress' | 'task' | 'reminder' | 'care';
    templateKey: string;
    payload: unknown;
    text: string;
  }) {
    const profileRows = await this.prisma.$queryRaw<ProfileLineRow[]>(Prisma.sql`
      select id, line_user_id
      from public.profiles
      where id = ${input.targetProfileId}::uuid
      limit 1
    `);

    const profile = profileRows[0];
    if (!profile) {
      throw new NotFoundException('Target profile not found');
    }

    if (!profile.line_user_id) {
      await this.insertLineMessageLog({
        caseId: input.caseId,
        targetProfileId: input.targetProfileId,
        messageType: input.messageType,
        templateKey: input.templateKey,
        payload: input.payload,
        lineMessageId: null,
        deliveryStatus: 'skipped_no_line_user',
      });

      return { ok: false, deliveryStatus: 'skipped_no_line_user' };
    }

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      await this.insertLineMessageLog({
        caseId: input.caseId,
        targetProfileId: input.targetProfileId,
        messageType: input.messageType,
        templateKey: input.templateKey,
        payload: input.payload,
        lineMessageId: null,
        deliveryStatus: 'skipped_no_channel_token',
      });

      return { ok: false, deliveryStatus: 'skipped_no_channel_token' };
    }

    const resp = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: profile.line_user_id,
        messages: [{ type: 'text', text: input.text }],
      }),
    });

    const deliveryStatus = resp.ok ? 'sent' : `failed_${resp.status}`;
    await this.insertLineMessageLog({
      caseId: input.caseId,
      targetProfileId: input.targetProfileId,
      messageType: input.messageType,
      templateKey: input.templateKey,
      payload: input.payload,
      lineMessageId: null,
      deliveryStatus,
    });

    return { ok: resp.ok, deliveryStatus };
  }

  private async insertLineMessageLog(input: {
    caseId?: string;
    targetProfileId: string;
    messageType: 'progress' | 'task' | 'reminder' | 'care';
    templateKey: string;
    payload: unknown;
    lineMessageId: string | null;
    deliveryStatus: string;
  }) {
    await this.prisma.$executeRaw(Prisma.sql`
      insert into public.line_messages (
        case_id,
        target_profile_id,
        message_type,
        template_key,
        payload,
        line_message_id,
        delivery_status
      ) values (
        ${input.caseId ?? null}::uuid,
        ${input.targetProfileId}::uuid,
        ${input.messageType},
        ${input.templateKey},
        ${JSON.stringify(input.payload)}::jsonb,
        ${input.lineMessageId},
        ${input.deliveryStatus}
      )
    `);
  }

  private verifyLineSignature(rawBody: string, signature?: string): boolean {
    const secret = process.env.LINE_CHANNEL_SECRET;
    if (!secret || !signature) {
      return false;
    }

    const digest = createHmac('sha256', secret).update(rawBody).digest('base64');
    return digest === signature;
  }

  private async getProfileByLineUserId(lineUserId: string): Promise<{ id: string } | null> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      select id
      from public.profiles
      where line_user_id = ${lineUserId}
      limit 1
    `);

    return rows[0] || null;
  }

  private async getLatestPendingTaskId(profileId: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      select id
      from public.tasks
      where assigned_to_profile_id = ${profileId}::uuid
        and status in ('pending', 'replied')
      order by due_at asc
      limit 1
    `);

    return rows[0]?.id || null;
  }

  private parseLineReplyText(text: string): LineReplyParsed {
    const normalized = text.trim();
    const parts = normalized.split(/\s+/);

    // Format example: task:<uuid> done 已完成聯繫
    let taskId: string | undefined;
    if (parts[0]?.startsWith('task:')) {
      taskId = parts[0].slice(5);
      parts.shift();
    }

    const first = (parts[0] || '').toLowerCase();

    const map: Record<string, LineReplyParsed['replyType']> = {
      done: 'done',
      完成: 'done',
      need_help: 'need_help',
      求助: 'need_help',
      協助: 'need_help',
      contacted: 'contacted',
      已聯絡: 'contacted',
      cannot_do: 'cannot_do',
      無法: 'cannot_do',
    };

    const replyType = map[first];
    const replyText = parts.slice(1).join(' ') || undefined;

    return { taskId, replyType, replyText };
  }
}
