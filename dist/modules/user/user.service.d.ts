import { AgentService } from '../agents/agent.service';
import { ChatService } from '../chat/chat.service';
import { Room } from '../chat/entities/room.entity';
import { NatsService } from '../nats/nats.service';
export declare class UserService {
    private readonly chatService;
    private readonly natsService;
    private readonly agentService;
    constructor(chatService: ChatService, natsService: NatsService, agentService: AgentService);
    requestAssistance(userId: string): Promise<{
        message: string;
        room: Room;
    }>;
    getQueueSize(): Promise<{
        queueSize: number;
        waitingRooms: {
            roomId: number;
            userId: string;
            roomName: string;
        }[];
    }>;
}
