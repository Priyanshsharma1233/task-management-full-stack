import { Body, Controller, Get, Post, Param, Patch, Delete, UseGuards ,Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) { }


  @Post()
CreateTask(@Req() req: any , @Body() dto: CreateTaskDto) {
  console.log('USER ID:', req.user.sub);
  return this.taskService.createTask(dto, req.user.sub);
}


  @Get()
  getTasks(@Req() req: any) {
  console.log(req.user);
  return this.taskService.getTasks(req.user.sub);
  }

  @Get(':id')
  getTaskById(@Req() req:any,@Param('id')  id: string) {
    return this.taskService.getTaskById(id,req.user.sub);
  }

  @Patch(':id')
  updateTask(@Req() req:any,@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(id, dto,req.user.sub);
  }
  @Delete(':id')
  deleteTask(@Param('id') id: string,@Req() req:any) {
   return this.taskService.deleteTask(id,req.user.sub);
  }


}
