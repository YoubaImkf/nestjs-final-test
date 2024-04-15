import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Task, User } from '@prisma/client';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {}

    async addTask(
        name: string,
        userId: string,
        priority: number,
    ): Promise<Task> {
        await this.validateCreateTaskInputs(name, userId, priority);
        const userExists = await this.userExists(userId);
        if (!userExists) throw new NotFoundException('User not found');

        return this.createTask(name, userId, priority);
    }

    async getTaskByName(name: string): Promise<Task> {
        const task: Task = await this.findTaskByName(name);
        if (!task) throw new NotFoundException('Task not found');

        return task;
    }

    async getUserTasks(userId: string): Promise<Task[]> {
        if (!this.isUUID(userId))
            throw new BadRequestException('Invalid user ID format');
        const userExists = await this.userExists(userId);
        if (!userExists) throw new NotFoundException('User not found');

        return this.findTasksByUser(userId);
    }

    async resetData(): Promise<void> {
        await this.prisma.task.deleteMany({});
    }

    /* *
     * Private Methods
     * */
    private async findTaskByName(name: string): Promise<Task> {
        return this.prisma.task.findFirst({
            where: {
                name: name,
            },
        });
    }

    private async createTask(
        name: string,
        userId: string,
        priority: number,
    ): Promise<Task> {
        return this.prisma.task.create({
            data: {
                name: name,
                userId: userId,
                priority: priority,
            },
        });
    }

    private async validateCreateTaskInputs(
        name: string,
        userId: string,
        priority: number,
    ): Promise<void> {
        if (
            !name ||
            !(typeof name === 'string') ||
            !userId ||
            isNaN(priority) ||
            priority <= 0
        )
            throw new BadRequestException('Invalid input data');

        if (!this.isUUID(userId))
            throw new BadRequestException('Invalid user ID format');
    }

    private async findTasksByUser(userId: string): Promise<Task[]> {
        return this.prisma.task.findMany({
            where: {
                userId: userId,
            },
        });
    }

    private isUUID(userId: string): boolean {
        const regex: RegExp = new RegExp(
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$',
        );
        return regex.test(userId);
    }

    private async userExists(userId: string): Promise<boolean> {
        const user: User | null = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        return user !== null;
    }
}
