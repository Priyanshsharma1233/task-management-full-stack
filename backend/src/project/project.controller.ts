import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
  ) {}

  @Post()
  createProject(
    @Req() req: any,
    @Body() dto: CreateProjectDto,
  ) {
    console.log('USER ID:', req.user.sub);

    return this.projectService.createProject(
      dto,
      req.user.sub,
    );
  }

  @Get()
  getProjects(@Req() req: any) {
    return this.projectService.getProjects(
      req.user.sub,
    );
  }

  @Get(':id')
  getProjectById(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.projectService.getProjectById(
      id,
      req.user.sub,
    );
  }

  @Patch(':id')
  updateProject(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(
      id,
      dto,
      req.user.sub,
    );
  }

  @Delete(':id')
  deleteProject(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.projectService.deleteProject(
      id,
      req.user.sub,
    );
  }
}