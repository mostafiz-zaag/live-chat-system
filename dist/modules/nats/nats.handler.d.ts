import { NatsConnection } from 'nats';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { ChatService } from '../chat/chat.service';
export declare class NatsHandlers {
    private readonly nc;
    private readonly chatService;
    private readonly agentRepository;
    private js;
    private readonly logger;
    constructor(nc: NatsConnection, chatService: ChatService, agentRepository: Repository<Agent>);
    private setupConsumers;
    private handleUserRequest;
    private handleAgentReady;
    private assignAgentToUser;
}
