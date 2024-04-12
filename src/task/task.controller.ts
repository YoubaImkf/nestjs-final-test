import { Body, Controller, Param, Post, Get, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { Task } from '@prisma/client';
import { AddTaskDto } from './dtos/add-task.dto';

@ApiTags('task')
@Controller()
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    async addTask(@Body() addTaskDto: AddTaskDto): Promise<Task> {
        const { name, userId, priority } = addTaskDto;
        return await this.taskService.addTask(name, userId, priority);
    }

    @Get(':name')
    async getTask(@Param('name') name: string): Promise<Task> {
        return await this.taskService.getTaskByName(name);
    }

    @Get('user/:userId')
    async validateUser(@Param('userId') userId: string): Promise<Task[]> {
        return await this.taskService.getUserTasks(userId);
    }

    @Delete('reset')
    async resetData(): Promise<void> {
        await this.taskService.resetData();
    }
}
