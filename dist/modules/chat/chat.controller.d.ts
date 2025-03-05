import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    leaveQueue(userId: string): Promise<{
        message: string;
    }>;
}
