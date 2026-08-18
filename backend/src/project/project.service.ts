import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prismaService: PrismaService) {}

  async createProject(dto: CreateProjectDto, userId: string) {
    return this.prismaService.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,

        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async getProjects(userId: string) {
    return this.prismaService.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProjectById(id: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prismaService.project.update({
      where: {
        id,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.status !== undefined && {
          status: dto.status,
        }),

        ...(dto.priority !== undefined && {
          priority: dto.priority,
        }),

        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate
            ? new Date(dto.dueDate)
            : null,
        }),
      },
    });
  }

  async deleteProject(id: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prismaService.project.delete({
      where: {
        id,
      },
    });
  }
}