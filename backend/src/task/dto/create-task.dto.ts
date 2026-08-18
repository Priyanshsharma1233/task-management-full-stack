import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { Priority, TaskStatus } from 'generated/prisma/enums';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Priority)
  priority!: Priority;

  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsDateString()
  dueDate!: string;
}