import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  AddCaseParticipantDto,
  CreateCaseDto,
  CreateTaskDto,
  CreateTaskReplyDto,
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
}
