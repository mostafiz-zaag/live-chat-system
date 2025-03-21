import { Body, Controller, Get, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agents')
export class AgentController {
    constructor(private readonly agentsService: AgentService) {}

    @Post('ready')
    async joinQueue(@Body('agentId') agentId: string) {
        return this.agentsService.joinQueue(agentId);
    }

    @Post('/busy')
    async markAgentBusy(@Body('agentId') agentId: string) {
        return this.agentsService.markAgentBusy(agentId);
    }

    @Post('finish-chat')
    async finishChat(@Body('agentId') agentId: string) {
        return this.agentsService.finishChat(agentId);
    }

    @Get('all-ready-agents')
    async getAgents() {
        return this.agentsService.getAllReadyAgents();
    }

    @Get('/all')
    async getAllAgents() {
        return this.agentsService.getAllAgents();
    }
}
