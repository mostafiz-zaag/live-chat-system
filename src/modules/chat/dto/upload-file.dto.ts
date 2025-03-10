import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
export enum SenderType {
    USER = 'user',
    AGENT = 'agent',
}

export class UploadFileDto {
    @IsNotEmpty({ message: 'Room ID is required.' })
    @IsUUID('4', { message: 'Room ID must be a valid UUID.' }) // Ensure it's a valid UUID
    roomId: string;

    @IsNotEmpty({ message: 'Sender type is required.' })
    @IsEnum(SenderType, {
        message: 'Sender type must be either "user" or "agent".',
    })
    senderType: SenderType;
}
