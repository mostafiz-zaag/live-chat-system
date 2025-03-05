import { Message } from './message.entity';
export declare class Room {
    id: number;
    name: string;
    userId: string | null;
    agentId: string | null;
    messages: Message[];
}
