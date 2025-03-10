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
        let agent = await this.agentRepository.findOne({ where: { agentId } });
        if (!agent) {
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
        }
        else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
        }
        let assignedRoom = await this.roomRepository.findOne({
            where: { agentId: (0, typeorm_2.IsNull)() },
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
    async finishChat(agentId) {
        let agent = await this.agentRepository.findOne({ where: { agentId } });
        if (!agent) {
            agent = this.agentRepository.create({ agentId, status: 'ready' });
            await this.agentRepository.save(agent);
        }
        else {
            await this.agentRepository.update({ agentId }, { status: 'ready' });
        }
        let assignedRoom = await this.roomRepository.findOne({
            where: { agentId: (0, typeorm_2.IsNull)() },
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
    async markAgentBusy(agentId) {
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });
        if (!agent) {
            return { message: `Agent ${agentId} not found.` };
        }
        await this.agentRepository.update({ agentId }, { status: 'busy' });
        return { message: `Agent ${agentId} marked as busy.` };
    }
    async getAgentById(agentId) {
        return await this.agentRepository.findOne({
            where: { agentId },
        });
    }
    async updateAgentStatus(agentId, status) {
        const agent = await this.agentRepository.findOne({
            where: { agentId },
        });
        if (!agent) {
            return { message: `Agent ${agentId} not found.` };
        }
        await this.agentRepository.update({ agentId }, { status });
        return { message: `Agent ${agentId} status updated to ${status}.` };
    }
    async createAgent(agentDto) {
        const { agentId, name, status } = agentDto;
        const existingAgent = await this.agentRepository.findOne({
            where: { name },
        });
        const existingAgentID = await this.agentRepository.findOne({
            where: { agentId },
        });
        if (existingAgentID) {
            throw new common_1.BadRequestException(`Agent with ${agentId} already exists.`);
        }
        if (existingAgent) {
            throw new common_1.BadRequestException(`Agent with ${name} already exists.`);
        }
        const newAgent = this.agentRepository.create({ agentId, name, status });
        await this.agentRepository.save(newAgent);
        return {
            message: `Agent "${name}" created successfully.`,
            agent: newAgent,
        };
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