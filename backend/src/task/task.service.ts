import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) {}

  async createTask(dto: CreateTaskDto, userId: string) {
  return this.prismaService.task.create({
    data: {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: new Date(dto.dueDate),

      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

  async getTasks(userId: string) {
  return this.prismaService.task.findMany({
    where: {
      userId: userId,
    },
  });
}

  async getTaskById(id: string ,userId: string) {
  const task = await this.prismaService.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (task == null) {
    throw new NotFoundException('Task not found');
  }
  return task;
}

  async updateTask(id: string, dto: UpdateTaskDto, userId: string) {
  const task = await this.prismaService.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  return this.prismaService.task.update({
    where: {
      id,
    },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.dueDate !== undefined && {
        dueDate: new Date(dto.dueDate),
      }),
    },
  });
}

  async deleteTask(id: string, userId: string) {
  const task = await this.prismaService.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  return this.prismaService.task.delete({
    where: {
      id,
    },
  });
}
}