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
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("./agent.service");
const agent_dto_1 = require("./dto/agent.dto");
let AgentController = class AgentController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async joinQueue(agentStatusDto) {
        return this.agentService.joinQueue(agentStatusDto.agentId);
    }
    async markAgentBusy(agentStatusDto) {
        return this.agentService.markAgentBusy(agentStatusDto.agentId);
    }
    async finishChat(agentStatusDto) {
        return this.agentService.finishChat(agentStatusDto.agentId);
    }
    async getAgents() {
        return this.agentService.getAllReadyAgents();
    }
    async getAllAgents() {
        return this.agentService.getAllAgents();
    }
    async updateAgentStatus(agentId, agentStatusDto) {
        return this.agentService.updateAgentStatus(agentId, agentStatusDto.status);
    }
    async getAgentById(agentId) {
        return this.agentService.getAgentById(agentId);
    }
    async createAgent(agentStatusDto) {
        return this.agentService.createAgent(agentStatusDto);
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)('ready'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_dto_1.AgentStatusDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "joinQueue", null);
__decorate([
    (0, common_1.Post)('busy'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_dto_1.AgentStatusDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "markAgentBusy", null);
__decorate([
    (0, common_1.Post)('finish-chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_dto_1.AgentStatusDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "finishChat", null);
__decorate([
    (0, common_1.Get)('all-ready-agents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAllAgents", null);
__decorate([
    (0, common_1.Put)(':agentId/status'),
    __param(0, (0, common_1.Param)('agentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, agent_dto_1.AgentStatusDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateAgentStatus", null);
__decorate([
    (0, common_1.Get)(':agentId'),
    __param(0, (0, common_1.Param)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAgentById", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_dto_1.AgentStatusDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "createAgent", null);
exports.AgentController = AgentController = __decorate([
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map