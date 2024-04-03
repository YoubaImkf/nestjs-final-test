import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { EmailUserDto } from './dtos/email-user.dto';
import { UserDto } from './dtos/user.dto';

@ApiTags('user')
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':email')
    async getUserByEmail(
        @Param() emailUserDto: EmailUserDto,
    ): Promise<UserDto> {
        const { email } = emailUserDto;
        return await this.userService.getUser(email);
    }

    @Post()
    async addUser(@Body() emailUserDto: EmailUserDto): Promise<User> {
        const { email } = emailUserDto;
        return await this.userService.addUser(email);
    }

    @Delete('reset')
    async resetData(): Promise<void> {
        await this.userService.resetData();
    }
}
