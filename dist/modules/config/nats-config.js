"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATS_CONFIG = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.NATS_CONFIG = [
    {
        name: 'NATS_SERVICE',
        transport: microservices_1.Transport.NATS,
        options: {
            servers: process.env.NATS_SERVERS?.split(',') || [
                'nats://localhost:4222',
            ],
        },
    },
];
//# sourceMappingURL=nats-config.js.map