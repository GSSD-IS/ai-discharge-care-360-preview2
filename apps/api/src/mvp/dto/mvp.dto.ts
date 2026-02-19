import {
  IsArray,
  IsBoolean,
  IsInt,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateCaseDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  patientProfileId: string;

  @IsIn(['S0', 'S1', 'S2', 'S3', 'S4', 'E1'])
  currentState: string;

  @IsOptional()
  @IsString()
  nextAction?: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsString()
  careMessage?: string;

  @IsUUID()
  createdBy: string;
}

export class AddCaseParticipantDto {
  @IsUUID()
  profileId: string;

  @IsIn(['case_manager', 'patient', 'family', 'external_org'])
  participantType: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactNote?: string;
}

export class UpdateCaseStateDto {
  @IsIn(['S0', 'S1', 'S2', 'S3', 'S4', 'E1'])
  currentState: string;

  @IsOptional()
  @IsString()
  nextAction?: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsString()
  careMessage?: string;
}

export class CreateTaskDto {
  @IsUUID()
  caseId: string;

  @IsUUID()
  assignedToProfileId: string;

  @IsIn(['contact_confirm', 'document_followup', 'org_coordination', 'care_reminder'])
  taskType: string;

  @IsString()
  @IsNotEmpty()
  taskTitle: string;

  @IsOptional()
  @IsString()
  taskDetail?: string;

  @IsISO8601()
  dueAt: string;

  @IsUUID()
  createdBy: string;
}

export class CreateTaskReplyDto {
  @IsUUID()
  replierProfileId: string;

  @IsIn(['done', 'need_help', 'contacted', 'cannot_do'])
  replyType: string;

  @IsOptional()
  @IsString()
  replyText?: string;

  @IsOptional()
  @IsIn(['line', 'web'])
  replyChannel?: string;
}

export class SendProgressNotificationDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsUUID()
  targetProfileId: string;

  @IsIn(['S0', 'S1', 'S2', 'S3', 'S4', 'E1'])
  currentState: string;

  @IsString()
  nextAction: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsString()
  caseManagerName?: string;

  @IsOptional()
  @IsString()
  caseManagerPhone?: string;

  @IsOptional()
  @IsString()
  careMessage?: string;
}

export class SendTaskNotificationDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsUUID()
  targetProfileId: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsString()
  @IsNotEmpty()
  taskTitle: string;

  @IsOptional()
  @IsString()
  taskDetail?: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsString()
  careMessage?: string;
}

export class LineWebhookDto {
  @IsOptional()
  @IsObject()
  destination?: Record<string, unknown>;

  @IsArray()
  @IsObject({ each: true })
  events: Record<string, unknown>[];
}

export class RunReminderJobDto {
  @IsOptional()
  @IsISO8601()
  nowIso?: string;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
