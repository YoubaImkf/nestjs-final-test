import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { Prisma, Task, User } from '@prisma/client';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {}

    async addTask(
        name: string,
        userId: string,
        priority: number,
    ): Promise<Task> {
        const priorityNumber = this.convertToNumber(priority);

        await this.validateCreateTaskInputs(name, userId, priorityNumber);

        const userExists = await this.userExists(userId);
        if (!userExists) throw new NotFoundException('User not found');

        return this.createTask(name, userId, priorityNumber);
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
        try {
            await this.prisma.task.deleteMany({});
        } catch (error) {
            console.error(
                `An error occurred while resetting task data: ${error.message}`,
            );
        }
    }

    /* *
     * Private Methods
     * */
    private async findTaskByName(name: string): Promise<Task> {
        try {
            return await this.prisma.task.findFirst({
                where: {
                    name: name,
                },
            });
        } catch (error) {
            console.error(
                `An error occurred while finding task by name: ${error.message}`,
            );
        }
    }

    private async createTask(
        name: string,
        userId: string,
        priority: number,
    ): Promise<Task> {
        try {
            return await this.prisma.task.create({
                data: {
                    name: name,
                    userId: userId,
                    priority: priority,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.error('There is a unique constraint violation');
            }
            console.error(
                `An error occurred while creating task: ${error.message}`,
            );
        }
    }

    private convertToNumber(priority: number | string): number {
        if (typeof priority === 'string') {
            const parsedPriority = parseInt(priority, 10);
            if (isNaN(parsedPriority) || parsedPriority <= 0) {
                throw new BadRequestException('Invalid priority format');
            }
            return parsedPriority;
        }
        return priority;
    }

    private async validateCreateTaskInputs(
        name: string,
        userId: string,
        priority: number,
    ): Promise<void> {
        if (!name || !(typeof name === 'string') || !userId || priority <= 0) {
            throw new BadRequestException('Invalid input data');
        }

        if (!this.isUUID(userId)) {
            throw new BadRequestException('Invalid user ID format');
        }
    }

    private async findTasksByUser(userId: string): Promise<Task[]> {
        try {
            return await this.prisma.task.findMany({
                where: {
                    userId: userId,
                },
            });
        } catch (error) {
            console.error(
                `An error occurred while finding tasks by user: ${error.message}`,
            );
        }
    }

    private isUUID(userId: string): boolean {
        const regex: RegExp = new RegExp(
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$',
        );
        return regex.test(userId);
    }

    private async userExists(userId: string): Promise<boolean> {
        try {
            const user: User | null = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            return user !== null;
        } catch (error) {
            console.error(
                `An error occurred while checking if the user exists: ${error}`,
            );
        }
    }
}
