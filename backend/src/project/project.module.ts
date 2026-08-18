import { Module } from '@nestjs/common';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';


@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService],
 
})
export class ProjectModule {}