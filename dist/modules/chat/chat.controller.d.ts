import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatService } from './chat.service';
interface S3File extends Express.Multer.File {
    key: string;
}
export declare class ChatController {
    private readonly chatService;
    private eventEmitter;
    constructor(chatService: ChatService, eventEmitter: EventEmitter2);
    uploadFile(file: S3File, roomId: string): Promise<{
        message: string;
        fileUrl?: undefined;
    } | {
        message: string;
        fileUrl: string;
    }>;
    leaveQueue(userId: string): Promise<{
        message: string;
    }>;
    leaveUserChat(userId: string): Promise<{
        message: string;
    }>;
    leaveChat(agentId: string): Promise<{
        message: string;
        roomId?: number;
        userId?: string;
    }>;
}
export {};
