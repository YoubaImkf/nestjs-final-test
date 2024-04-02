import { IsDate, IsEmail, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserDto {
    @IsString()
    @Expose()
    firstName: string;

    @IsString()
    @Expose()
    lastName: string;

    @IsEmail()
    @Expose()
    email: string;

    @IsDate()
    @Expose()
    createdAt: Date;
}
