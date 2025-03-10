import { ClientsModuleOptions, Transport } from '@nestjs/microservices';

export const NATS_CONFIG: ClientsModuleOptions = [
    {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
            servers: process.env.NATS_SERVERS?.split(',') || [
                'nats://localhost:4222',
            ], // ✅ Read from .env
        },
    },
];
