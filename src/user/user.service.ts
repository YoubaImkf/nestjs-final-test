import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllUsers(): Promise<User[]> {
        try {
            return this.prisma.user.findMany({
                include: {
                    tasks: true,
                },
            });
        } catch (error) {
            console.error(
                `An error occurred while getting all users: ${error}`,
            );
        }
    }

    async getUser(email: string): Promise<User> {
        const user: User = await this.findUserByEmail(email);
        if (user === null || user === undefined) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async addUser(email: string): Promise<User> {
        this.validateEmail(email);
        await this.checkIfUserExists(email);
        return this.createUser(email);
    }

    async resetData(): Promise<void> {
        try {
            await this.prisma.user.deleteMany({});
        } catch (error) {
            console.error(
                `An error occurred while resetting task data: ${error.message}`,
            );
        }
    }

    /* *
     * Private Methods
     * */
    private async findUserByEmail(email: string): Promise<User> {
        try {
            return await this.prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
        } catch (error) {
            console.error(
                `An error occurred while finding user by email: ${error}`,
            );
        }
    }

    private async createUser(email: string): Promise<User> {
        try {
            return await this.prisma.user.create({
                data: {
                    email: email,
                },
            });
        } catch (error) {
            console.error(`An error occurred while creating user: ${error}`);
        }
    }

    private async checkIfUserExists(email: string): Promise<void> {
        const user: User = await this.findUserByEmail(email);
        if (user) {
            throw new ConflictException('User already exists');
        }
    }

    private validateEmail(email: string): void {
        if (!this.isValidEmail(email))
            throw new BadRequestException('Invalid email address');
    }

    private isValidEmail(email: string): boolean {
        const regex: RegExp = new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
        return regex.test(email);
    }
}
