"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_module_1 = require("../chat/chat.module");
const room_entity_1 = require("../chat/entities/room.entity");
const nats_module_1 = require("../nats/nats.module");
const agent_controller_1 = require("./agent.controller");
const agent_service_1 = require("./agent.service");
const agent_entity_1 = require("./entities/agent.entity");
let AgentModule = class AgentModule {
};
exports.AgentModule = AgentModule;
exports.AgentModule = AgentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_entity_1.Agent, room_entity_1.Room]),
            nats_module_1.NatsModule,
            chat_module_1.ChatModule,
        ],
        controllers: [agent_controller_1.AgentController],
        providers: [agent_service_1.AgentService],
        exports: [agent_service_1.AgentService, typeorm_1.TypeOrmModule],
    })
], AgentModule);
//# sourceMappingURL=agent.module.js.map