import { AgentService } from './agent.service';
import { AgentStatusDto } from './dto/agent.dto';
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    joinQueue(agentStatusDto: AgentStatusDto): Promise<{
        message: string;
        assignedRoom: import("../chat/entities/room.entity").Room | null;
        totalReadyAgents: number;
        readyAgents: import("./entities/agent.entity").Agent[];
    }>;
    markAgentBusy(agentStatusDto: AgentStatusDto): Promise<{
        message: string;
    }>;
    finishChat(agentStatusDto: AgentStatusDto): Promise<{
        message: string;
        assignedRoom: import("../chat/entities/room.entity").Room | null;
        totalReadyAgents: number;
        readyAgents: import("./entities/agent.entity").Agent[];
    }>;
    getAgents(): Promise<{
        totalReadyAgents: number;
        readyAgents: import("./entities/agent.entity").Agent[];
    }>;
    getAllAgents(): Promise<{
        totalAgents: number;
        agents: import("./entities/agent.entity").Agent[];
    }>;
    updateAgentStatus(agentId: string, agentStatusDto: AgentStatusDto): Promise<{
        message: string;
    }>;
    getAgentById(agentId: string): Promise<import("./entities/agent.entity").Agent | null>;
    createAgent(agentStatusDto: AgentStatusDto): Promise<{
        message: string;
        agent: import("./entities/agent.entity").Agent;
    }>;
}
