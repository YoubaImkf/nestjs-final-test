import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddTaskDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty()
    priority: number;
}
