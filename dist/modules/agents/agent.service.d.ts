import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import { Agent } from './entities/agent.entity';
export declare class AgentService {
    private readonly natsClient;
    private readonly agentRepository;
    private readonly roomRepository;
    constructor(natsClient: ClientProxy, agentRepository: Repository<Agent>, roomRepository: Repository<Room>);
    joinQueue(agentId: string): Promise<{
        message: string;
        assignedRoom?: Room;
        totalReadyAgents: number;
        readyAgents: Agent[];
    }>;
    finishChat(agentId: string): Promise<{
        message: string;
        assignedRoom?: Room;
        totalReadyAgents: number;
        readyAgents: Agent[];
    }>;
    getAllAgents(): Promise<{
        totalReadyAgents: number;
        readyAgents: Agent[];
    }>;
    getNextAvailableAgent(): Promise<Agent | null>;
    markAgentBusy(agentId: string): Promise<void>;
}
