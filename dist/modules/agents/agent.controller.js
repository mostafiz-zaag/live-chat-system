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
let AgentController = class AgentController {
    constructor(agentsService) {
        this.agentsService = agentsService;
    }
    async joinQueue(agentId) {
        return this.agentsService.joinQueue(agentId);
    }
    async finishChat(agentId) {
        return this.agentsService.finishChat(agentId);
    }
    async getAgents() {
        return this.agentsService.getAllReadyAgents();
    }
    async getAllAgents() {
        return this.agentsService.getAllAgents();
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)('join-queue'),
    __param(0, (0, common_1.Body)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "joinQueue", null);
__decorate([
    (0, common_1.Post)('finish-chat'),
    __param(0, (0, common_1.Body)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "finishChat", null);
__decorate([
    (0, common_1.Get)('all-ready-agents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Get)('/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAllAgents", null);
exports.AgentController = AgentController = __decorate([
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map