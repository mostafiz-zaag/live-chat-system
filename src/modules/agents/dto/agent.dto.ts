import { IsEnum, IsNotEmpty, Length } from 'class-validator';

export class AgentStatusDto {
    @IsNotEmpty({ message: 'Agent ID is required.' })
    agentId: string;

    @IsNotEmpty({ message: 'Name is required.' })
    @Length(3, 50, { message: 'Name must be between 3 and 50 characters.' })
    name: string;

    @IsNotEmpty({ message: 'Status is required.' })
    @IsEnum(['ready', 'busy', 'offline'], {
        message: 'Status must be "ready", "busy", or "offline".',
    })
    status: 'ready' | 'busy' | 'offline';
}
