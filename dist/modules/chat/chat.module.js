"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const typeorm_1 = require("@nestjs/typeorm");
const agent_entity_1 = require("../agents/entities/agent.entity");
const nats_config_1 = require("../config/nats-config");
const s3_config_1 = require("../config/s3-config");
const chat_controller_1 = require("./chat.controller");
const chat_repository_1 = require("./chat.repository");
const chat_service_1 = require("./chat.service");
const message_entity_1 = require("./entities/message.entity");
const room_entity_1 = require("./entities/room.entity");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message, room_entity_1.Room, agent_entity_1.Agent]),
            microservices_1.ClientsModule.register(nats_config_1.NATS_CONFIG),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_repository_1.ChatRepository, chat_service_1.ChatService, s3_config_1.S3ConfigService],
        exports: [chat_repository_1.ChatRepository, chat_service_1.ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map