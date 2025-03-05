import { Body, Controller, Get, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agents')
export class AgentController {
    constructor(private readonly agentsService: AgentService) {}

    @Post('join-queue')
    async joinQueue(@Body('agentId') agentId: string) {
        return this.agentsService.joinQueue(agentId);
    }

    @Post('finish-chat')
    async finishChat(@Body('agentId') agentId: string) {
        return this.agentsService.finishChat(agentId);
    }

    @Get('all')
    async getAgents() {
        return this.agentsService.getAllAgents();
    }
}
