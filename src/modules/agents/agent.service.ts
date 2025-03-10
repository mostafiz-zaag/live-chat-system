import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import { AgentStatusDto } from './dto/agent.dto';
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

    async joinQueue(agentId: string) {
        let agent = await this.agentRepository.findOne({ where: { agentId } });

        if (!agent) {
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
        } else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
        }

        let assignedRoom = await this.roomRepository.findOne({
            where: { agentId: IsNull() },
        });

        if (assignedRoom) {
            assignedRoom.agentId = agentId;
            await this.roomRepository.save(assignedRoom);

            await this.agentRepository.update({ agentId }, { status: 'busy' });

            await this.natsClient
                .emit('agent.assigned', { agentId, roomId: assignedRoom.id })
                .toPromise();
        }

        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });

        return {
            message: assignedRoom
                ? `Agent ${agentId} assigned to Room ${assignedRoom.id}.`
                : `Agent ${agentId} is ready.`,
            assignedRoom,
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }

    async finishChat(agentId: string) {
        let agent = await this.agentRepository.findOne({ where: { agentId } });

        if (!agent) {
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
        } else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
        }

        let assignedRoom = await this.roomRepository.findOne({
            where: { agentId: IsNull() },
        });

        if (assignedRoom) {
            assignedRoom.agentId = agentId;
            await this.roomRepository.save(assignedRoom);

            await this.natsClient
                .emit('agent.assigned', { agentId, roomId: assignedRoom.id })
                .toPromise();
        }

        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });

        return {
            message: assignedRoom
                ? `Agent ${agentId} finished chat and reassigned to Room ${assignedRoom.id}.`
                : `Agent ${agentId} is now ready.`,
            assignedRoom,
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }

    async getAllReadyAgents() {
        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });

        return {
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }

    async getAllAgents() {
        const agents = await this.agentRepository.find({});
        return {
            totalAgents: agents.length,
            agents,
        };
    }

    async getNextAvailableAgent() {
        return this.agentRepository.findOne({ where: { status: 'ready' } });
    }

    async markAgentBusy(agentId: string) {
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });

        if (!agent) {
            return { message: `Agent ${agentId} not found.` };
        }
        await this.agentRepository.update({ agentId }, { status: 'busy' });
        return { message: `Agent ${agentId} marked as busy.` };
    }

    async getAgentById(agentId: string) {
        return await this.agentRepository.findOne({
            where: { agentId },
        });
    }

    async updateAgentStatus(
        agentId: string,
        status: 'ready' | 'busy' | 'offline',
    ) {
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });

        if (!agent) {
            return { message: `Agent ${agentId} not found.` };
        }

        await this.agentRepository.update({ agentId }, { status });
        return { message: `Agent ${agentId} status updated to ${status}.` };
    }
    async createAgent(agentDto: AgentStatusDto) {
        const { agentId, name, status } = agentDto;

        // Check if the agent name already exists
        const existingAgent = await this.agentRepository.findOne({
            where: { name },
        });

        if (existingAgent) {
            throw new BadRequestException(
                `Agent with name "${name}" already exists.`,
            );
        }

        // Create new agent
        const newAgent = this.agentRepository.create({ agentId, name, status });
        await this.agentRepository.save(newAgent);

        return {
            message: `Agent "${name}" created successfully.`,
            agent: newAgent,
        };
    }
}
