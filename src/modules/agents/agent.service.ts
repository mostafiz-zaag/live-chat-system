import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentService {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        @InjectRepository(Agent)
        private readonly agentRepository: Repository<Agent>,
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
    ) {}

    /**
     * Agent Joins Queue & Gets Assigned to a Waiting User (if available)
     */
    async joinQueue(agentId: string): Promise<{
        message: string;
        assignedRoom?: Room;
        totalReadyAgents: number;
        readyAgents: Agent[];
    }> {
        console.log(`[JOIN QUEUE] Processing request for agent: ${agentId}`);

        let agent = await this.agentRepository.findOne({ where: { agentId } });

        if (!agent) {
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
            console.log(`[JOIN QUEUE] New agent created: ${agentId}`);
        } else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
            console.log(
                `[JOIN QUEUE] Agent ${agentId} status updated to 'ready'`,
            );
        }

        // ✅ Check for any waiting room
        let assignedRoom: Room | undefined =
            (await this.roomRepository.findOne({
                where: { agentId: IsNull() }, // Find room where no agent is assigned
            })) || undefined;

        if (assignedRoom) {
            assignedRoom.agentId = agentId;
            await this.roomRepository.save(assignedRoom);

            // ✅ Mark the agent as `busy`
            await this.agentRepository.update({ agentId }, { status: 'busy' });

            console.log(
                `[JOIN QUEUE] Assigned Agent ${agentId} to Waiting Room ${assignedRoom.id} and marked as busy.`,
            );

            await this.natsClient
                .emit('agent.assigned', { agentId, roomId: assignedRoom.id })
                .toPromise();
        }

        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });

        return {
            message: assignedRoom
                ? `Agent ${agentId} joined the queue and was assigned to Room ${assignedRoom.id}, now marked as busy.`
                : `Agent ${agentId} is now ready and waiting for a user.`,
            assignedRoom,
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }

    /**
     * Agent Finishes a Chat and Becomes Available
     */
    async finishChat(agentId: string): Promise<{
        message: string;
        assignedRoom?: Room;
        totalReadyAgents: number;
        readyAgents: Agent[];
    }> {
        console.log(`[FINISH CHAT] Processing request for agent: ${agentId}`);

        let agent = await this.agentRepository.findOne({ where: { agentId } });

        if (!agent) {
            console.warn(
                `[FINISH CHAT] Warning: Agent ${agentId} not found. Creating new entry.`,
            );
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
        } else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
        }

        // Check for any waiting room and assign agent
        let assignedRoom: Room | undefined =
            (await this.roomRepository.findOne({
                where: { agentId: IsNull() },
            })) || undefined;

        if (assignedRoom) {
            assignedRoom.agentId = agentId;
            await this.roomRepository.save(assignedRoom);
            console.log(
                `[FINISH CHAT] Assigned Agent ${agentId} to Waiting Room ${assignedRoom.id}`,
            );

            await this.natsClient
                .emit('agent.assigned', { agentId, roomId: assignedRoom.id })
                .toPromise();
        }

        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });

        return {
            message: assignedRoom
                ? `Agent ${agentId} finished chat and was assigned to Room ${assignedRoom.id}.`
                : `Agent ${agentId} is now ready and waiting for a user.`,
            assignedRoom,
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }

    /**
     * Get All Ready Agents
     */
    async getAllReadyAgents(): Promise<{
        totalReadyAgents: number;
        readyAgents: Agent[];
    }> {
        console.log(`[GET ALL AGENTS] Fetching agents with status 'ready'...`);

        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });

        console.log(
            `[GET ALL AGENTS] Found ${readyAgents.length} ready agents.`,
        );

        return {
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }

    async getAllAgents(): Promise<{
        totalAgents: number;
        Agents: Agent[];
    }> {
        console.log(`[GET ALL AGENTS] Fetching all agents...`);

        const agents = await this.agentRepository.find({});

        console.log(`[GET ALL AGENTS] Found ${agents.length} agents.`);

        return {
            totalAgents: agents.length,
            Agents: agents, // Corrected: Using the 'agents' variable here
        };
    }

    /**
     * Get Next Available Agent
     */
    async getNextAvailableAgent(): Promise<Agent | null> {
        return this.agentRepository.findOne({ where: { status: 'ready' } });
    }

    /**
     * Mark an Agent as Busy
     */
    async markAgentBusy(agentId: string): Promise<{ message: string }> {
        // find that agent
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });

        if (!agent) {
            console.warn(`[AGENT SERVICE] Agent ${agentId} not found.`);
            return {
                message: `Agent ${agentId} not found.`,
            };
        }
        await this.agentRepository.update({ agentId }, { status: 'busy' });
        console.log(`[AGENT SERVICE] Agent ${agentId} marked as busy.`);
        return {
            message: `Agent ${agentId} marked as busy.`,
        };
    }

    async getAgentById(agentId: string): Promise<Agent | null> {
        return await this.agentRepository.findOne({
            where: { agentId },
        });
    }
}
