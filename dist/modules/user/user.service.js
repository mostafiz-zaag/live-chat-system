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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agents/agent.service");
const chat_service_1 = require("../chat/chat.service");
const nats_service_1 = require("../nats/nats.service");
let UserService = class UserService {
    constructor(chatService, natsService, agentService) {
        this.chatService = chatService;
        this.natsService = natsService;
        this.agentService = agentService;
    }
    async requestAssistance(userId) {
        console.log(`[USER REQUEST] User ${userId} requested assistance.`);
        let { message, room: chatRoom } = await this.chatService.createRoom(userId);
        const readyAgent = await this.agentService.getNextAvailableAgent();
        if (readyAgent) {
            chatRoom.agentId = readyAgent.agentId;
            chatRoom = await this.chatService.updateRoom(chatRoom);
            const agent = await this.agentService.markAgentBusy(readyAgent.agentId);
            console.log('--------------agent after assigning-----------', agent);
            console.log(`[USER REQUEST] Assigned Agent ${readyAgent.agentId} to Room ${chatRoom.id}.`);
        }
        else {
            console.log(`[USER REQUEST] No agents available. Room ${chatRoom.id} is waiting.`);
        }
        await this.natsService.publish('user.request', {
            userId,
            roomId: chatRoom.id,
        });
        return {
            message: `Chat room created. ${readyAgent ? `Agent ${readyAgent.agentId} is assigned.` : `Waiting for an agent.`}`,
            room: chatRoom,
        };
    }
    async getQueueSize() {
        const queueSizeData = await this.chatService.getWaitingUsers();
        return queueSizeData;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        nats_service_1.NatsService,
        agent_service_1.AgentService])
], UserService);
//# sourceMappingURL=user.service.js.map