import { AgentService } from './agent.service';
export declare class AgentController {
    private readonly agentsService;
    constructor(agentsService: AgentService);
    joinQueue(agentId: string): Promise<{
        message: string;
        assignedRoom?: import("../chat/entities/room.entity").Room;
        totalReadyAgents: number;
        readyAgents: import("./entities/agent.entity").Agent[];
    }>;
    markAgentBusy(agentId: string): Promise<{
        message: string;
    }>;
    finishChat(agentId: string): Promise<{
        message: string;
        assignedRoom?: import("../chat/entities/room.entity").Room;
        totalReadyAgents: number;
        readyAgents: import("./entities/agent.entity").Agent[];
    }>;
    getAgents(): Promise<{
        totalReadyAgents: number;
        readyAgents: import("./entities/agent.entity").Agent[];
    }>;
    getAllAgents(): Promise<{
        totalAgents: number;
        Agents: import("./entities/agent.entity").Agent[];
    }>;
}
