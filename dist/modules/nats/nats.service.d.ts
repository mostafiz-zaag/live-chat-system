import { ClientProxy } from '@nestjs/microservices';
export declare class NatsService {
    private readonly natsClient;
    constructor(natsClient: ClientProxy);
    publish(subject: string, data: any): Promise<void>;
}
