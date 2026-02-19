import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MvpController } from './mvp.controller';
import { MvpService } from './mvp.service';

@Module({
  imports: [PrismaModule],
  controllers: [MvpController],
  providers: [MvpService],
})
export class MvpModule {}
