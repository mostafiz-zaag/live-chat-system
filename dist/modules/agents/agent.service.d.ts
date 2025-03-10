import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import { AgentStatusDto } from './dto/agent.dto';
import { Agent } from './entities/agent.entity';
export declare class AgentService {
    private readonly natsClient;
    private readonly agentRepository;
    private readonly roomRepository;
    constructor(natsClient: ClientProxy, agentRepository: Repository<Agent>, roomRepository: Repository<Room>);
    joinQueue(agentId: string): Promise<{
        message: string;
        assignedRoom: Room | null;
        totalReadyAgents: number;
        readyAgents: Agent[];
    }>;
    finishChat(agentId: string): Promise<{
        message: string;
        assignedRoom: Room | null;
        totalReadyAgents: number;
        readyAgents: Agent[];
    }>;
    getAllReadyAgents(): Promise<{
        totalReadyAgents: number;
        readyAgents: Agent[];
    }>;
    getAllAgents(): Promise<{
        totalAgents: number;
        agents: Agent[];
    }>;
    getNextAvailableAgent(): Promise<Agent | null>;
    markAgentBusy(agentId: string): Promise<{
        message: string;
    }>;
    getAgentById(agentId: string): Promise<Agent | null>;
    updateAgentStatus(agentId: string, status: 'ready' | 'busy' | 'offline'): Promise<{
        message: string;
    }>;
    createAgent(agentDto: AgentStatusDto): Promise<{
        message: string;
        agent: Agent;
    }>;
}
