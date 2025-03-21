"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const nats_service_1 = require("./nats.service");
let NatsModule = class NatsModule {
};
exports.NatsModule = NatsModule;
exports.NatsModule = NatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'NATS_SERVICE',
                    transport: microservices_1.Transport.NATS,
                    options: {
                        servers: ['nats://localhost:4222'],
                    },
                },
            ]),
        ],
        providers: [nats_service_1.NatsService],
        exports: [nats_service_1.NatsService, microservices_1.ClientsModule],
    })
], NatsModule);
//# sourceMappingURL=nats.module.js.map