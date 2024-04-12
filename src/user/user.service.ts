import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany({
            include: {
                tasks: true,
            },
        });
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
        await this.prisma.user.deleteMany({});
    }

    /* *
     * Private Methods
     * */
    private async findUserByEmail(email: string): Promise<User> {
        return this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
    }

    private async createUser(email: string): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: email,
            },
        });
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
