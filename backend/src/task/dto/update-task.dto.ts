import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { Priority, TaskStatus } from 'generated/prisma/enums';

export class UpdateTaskDto{
     @IsOptional()
     @IsString()
      title?: string;
    
      @IsOptional()
      @IsString()
      description?: string;
    
      @IsOptional()
      @IsEnum(Priority)
      priority?: Priority;

      @IsOptional()
      @IsEnum(TaskStatus)
      status?: TaskStatus;
    
      @IsOptional()
      @IsDateString()
      dueDate?: string;
}