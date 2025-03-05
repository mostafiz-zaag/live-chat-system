import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
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
