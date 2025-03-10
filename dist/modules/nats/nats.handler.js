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
var NatsHandlers_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsHandlers = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const nats_1 = require("nats");
const typeorm_2 = require("typeorm");
const agent_entity_1 = require("../agents/entities/agent.entity");
const chat_service_1 = require("../chat/chat.service");
let NatsHandlers = NatsHandlers_1 = class NatsHandlers {
    constructor(nc, chatService, agentRepository) {
        this.nc = nc;
        this.chatService = chatService;
        this.agentRepository = agentRepository;
        this.logger = new common_1.Logger(NatsHandlers_1.name);
        this.js = this.nc.jetstream();
        this.setupConsumers();
    }
    async setupConsumers() {
        try {
            const userSub = await this.js.pullSubscribe('user.request', (0, nats_1.consumerOpts)().durable('user-queue-consumer'));
            const agentSub = await this.js.pullSubscribe('agent.ready', (0, nats_1.consumerOpts)().durable('agent-queue-consumer'));
            (async () => {
                for await (const msg of userSub) {
                    try {
                        const userId = msg.data.toString();
                        await this.handleUserRequest(userId);
                        msg.ack();
                    }
                    catch (error) {
                        this.logger.error('Error handling user request', error);
                    }
                }
            })();
            (async () => {
                for await (const msg of agentSub) {
                    try {
                        const agentId = msg.data.toString();
                        await this.handleAgentReady(agentId);
                        msg.ack();
                    }
                    catch (error) {
                        this.logger.error('Error handling agent ready', error);
                    }
                }
            })();
        }
        catch (error) {
            this.logger.error('Error setting up consumers', error);
        }
    }
    async handleUserRequest(userId) {
        try {
            const agentSub = await this.js.pullSubscribe('agent.ready', (0, nats_1.consumerOpts)().durable('agent-queue-consumer'));
            await agentSub.pull({ batch: 1 });
            for await (const msg of agentSub) {
                const agentId = msg.data.toString();
                await this.assignAgentToUser(agentId, userId);
                msg.ack();
            }
        }
        catch (error) {
            this.logger.error(`Error handling user request for userId: ${userId}`, error);
        }
    }
    async handleAgentReady(agentId) {
        try {
            const userSub = await this.js.pullSubscribe('user.request', (0, nats_1.consumerOpts)().durable('user-queue-consumer'));
            await userSub.pull({ batch: 1 });
            for await (const msg of userSub) {
                const userId = msg.data.toString();
                await this.assignAgentToUser(agentId, userId);
                msg.ack();
            }
        }
        catch (error) {
            this.logger.error(`Error handling agent ready for agentId: ${agentId}`, error);
        }
    }
    async assignAgentToUser(agentId, userId) {
        try {
            const roomId = parseInt(userId, 10);
            await this.chatService.assignAgent(roomId, agentId);
            await this.agentRepository.update({ agentId }, { status: 'busy' });
            this.logger.log(`Assigned Agent ${agentId} to User ${userId} in Room ${roomId}`);
        }
        catch (error) {
            this.logger.error(`Error assigning agent ${agentId} to user ${userId}`, error);
        }
    }
};
exports.NatsHandlers = NatsHandlers;
exports.NatsHandlers = NatsHandlers = NatsHandlers_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [Object, chat_service_1.ChatService,
        typeorm_2.Repository])
], NatsHandlers);
//# sourceMappingURL=nats.handler.js.map