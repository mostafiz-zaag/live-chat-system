import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

// Define an Enum for the sender type
export enum SenderType {
    USER = 'user',
    AGENT = 'agent',
}

export class UploadFileDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    roomId: string; // The roomId to associate the file with

    @IsNotEmpty()
    @IsEnum(SenderType)
    senderType: SenderType; // Sender type (enum: user or agent)
}
