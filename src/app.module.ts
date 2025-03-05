import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentModule } from './modules/agents/agent.module';
import { ChatGateway } from './modules/chat/chat.gateway'; // ✅ Import WebSocket Gateway
import { ChatModule } from './modules/chat/chat.module';
import { NatsModule } from './modules/nats/nats.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres', // Default superuser
            password: 'root', // Your PostgreSQL password
            database: 'chat_system_db', // ✅ Correct database name (no backticks)
            entities: [__dirname + '/**/*.entity{.ts,.js}'], // ✅ Supports both TS & JS files
            synchronize: true, // ⚠️ Set to false in production, use migrations instead
        }),
        ChatModule,
        UserModule,
        NatsModule,
        AgentModule, // ✅ Remove duplicate ChatModule
    ],
    providers: [ChatGateway], // ✅ Register WebSocket Gateway
})
export class AppModule {}
