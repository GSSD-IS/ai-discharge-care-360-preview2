import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  AddCaseParticipantDto,
  CreateCaseDto,
  CreateTaskDto,
  CreateTaskReplyDto,
  LineWebhookDto,
  RunReminderJobDto,
  SendProgressNotificationDto,
  SendTaskNotificationDto,
  UpdateCaseStateDto,
} from './dto/mvp.dto';
import { MvpService } from './mvp.service';

@Controller('mvp')
export class MvpController {
  constructor(private readonly mvpService: MvpService) {}

  @Post('cases')
  async createCase(@Body() dto: CreateCaseDto) {
    return this.mvpService.createCase(dto);
  }

  @Post('cases/:caseId/participants')
  async addCaseParticipant(
    @Param('caseId') caseId: string,
    @Body() dto: AddCaseParticipantDto,
  ) {
    return this.mvpService.addCaseParticipant(caseId, dto);
  }

  @Patch('cases/:caseId/state')
  async updateCaseState(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateCaseStateDto,
  ) {
    return this.mvpService.updateCaseState(caseId, dto);
  }

  @Get('cases/:caseId/summary')
  async getCaseSummary(@Param('caseId') caseId: string) {
    return this.mvpService.getCaseSummary(caseId);
  }

  @Post('tasks')
  async createTask(@Body() dto: CreateTaskDto) {
    return this.mvpService.createTask(dto);
  }

  @Get('tasks/my')
  async getMyTasks(@Query('profileId') profileId: string) {
    return this.mvpService.getMyTasks(profileId);
  }

  @Post('tasks/:taskId/replies')
  async createTaskReply(
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskReplyDto,
  ) {
    return this.mvpService.createTaskReply(taskId, dto);
  }

  @Post('line/notify/progress')
  async sendProgressNotification(@Body() dto: SendProgressNotificationDto) {
    return this.mvpService.sendProgressNotification(dto);
  }

  @Post('line/notify/task')
  async sendTaskNotification(@Body() dto: SendTaskNotificationDto) {
    return this.mvpService.sendTaskNotification(dto);
  }

  @Post('line/webhook')
  async lineWebhook(
    @Req() req: Request,
    @Headers('x-line-signature') signature: string | undefined,
    @Body() dto: LineWebhookDto,
  ) {
    const rawBody = JSON.stringify(req.body || {});
    return this.mvpService.handleLineWebhook(rawBody, signature, dto);
  }

  @Post('jobs/reminder-run')
  async runReminderJob(@Body() dto: RunReminderJobDto) {
    return this.mvpService.runReminderJob(dto);
  }
}
