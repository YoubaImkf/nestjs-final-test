import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { UserDto } from './dtos/user.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async getUser(email: string): Promise<UserDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (user == null) throw new NotFoundException('User not found');

        return plainToClass(UserDto, user, {
            excludeExtraneousValues: true,
        });
    }

    async addUser(email: string): Promise<User> {
        const user = await this.getUser(email);
        if (user != null) {
            throw new ConflictException();
        }

        return this.prisma.user.create({
            data: {
                email: email,
            },
        });
    }

    async resetData(): Promise<void> {
        await this.prisma.user.deleteMany({});
    }
}
