"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const room_entity_1 = require("../chat/entities/room.entity");
const agent_entity_1 = require("./entities/agent.entity");
let AgentService = class AgentService {
    constructor(natsClient, agentRepository, roomRepository) {
        this.natsClient = natsClient;
        this.agentRepository = agentRepository;
        this.roomRepository = roomRepository;
    }
    async joinQueue(agentId) {
        console.log(`[JOIN QUEUE] Processing request for agent: ${agentId}`);
        let agent = await this.agentRepository.findOne({ where: { agentId } });
        if (!agent) {
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
            console.log(`[JOIN QUEUE] New agent created: ${agentId}`);
        }
        else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
            console.log(`[JOIN QUEUE] Agent ${agentId} status updated to 'ready'`);
        }
        let assignedRoom = (await this.roomRepository.findOne({
            where: { agentId: (0, typeorm_2.IsNull)() },
        })) || undefined;
        if (assignedRoom) {
            assignedRoom.agentId = agentId;
            await this.roomRepository.save(assignedRoom);
            await this.agentRepository.update({ agentId }, { status: 'busy' });
            console.log(`[JOIN QUEUE] Assigned Agent ${agentId} to Waiting Room ${assignedRoom.id} and marked as busy.`);
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
    async finishChat(agentId) {
        console.log(`[FINISH CHAT] Processing request for agent: ${agentId}`);
        let agent = await this.agentRepository.findOne({ where: { agentId } });
        if (!agent) {
            console.warn(`[FINISH CHAT] Warning: Agent ${agentId} not found. Creating new entry.`);
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
        }
        else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
        }
        let assignedRoom = (await this.roomRepository.findOne({
            where: { agentId: (0, typeorm_2.IsNull)() },
        })) || undefined;
        if (assignedRoom) {
            assignedRoom.agentId = agentId;
            await this.roomRepository.save(assignedRoom);
            console.log(`[FINISH CHAT] Assigned Agent ${agentId} to Waiting Room ${assignedRoom.id}`);
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
    async getAllReadyAgents() {
        console.log(`[GET ALL AGENTS] Fetching agents with status 'ready'...`);
        const readyAgents = await this.agentRepository.find({
            where: { status: 'ready' },
        });
        console.log(`[GET ALL AGENTS] Found ${readyAgents.length} ready agents.`);
        return {
            totalReadyAgents: readyAgents.length,
            readyAgents,
        };
    }
    async getAllAgents() {
        console.log(`[GET ALL AGENTS] Fetching all agents...`);
        const agents = await this.agentRepository.find({});
        console.log(`[GET ALL AGENTS] Found ${agents.length} agents.`);
        return {
            totalAgents: agents.length,
            Agents: agents,
        };
    }
    async getNextAvailableAgent() {
        return this.agentRepository.findOne({ where: { status: 'ready' } });
    }
    async markAgentBusy(agentId) {
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
    async getAgentById(agentId) {
        return await this.agentRepository.findOne({
            where: { agentId },
        });
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('NATS_SERVICE')),
    __param(1, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(2, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AgentService);
//# sourceMappingURL=agent.service.js.map