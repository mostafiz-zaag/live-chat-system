import { ClientProxy } from '@nestjs/microservices';
import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    private readonly natsClient;
    constructor(chatService: ChatService, natsClient: ClientProxy);
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
    uploadFile(file: Express.Multer.File, roomId: string): Promise<{
        message: string;
        fileUrl?: undefined;
    } | {
        message: string;
        fileUrl: string;
    }>;
}
