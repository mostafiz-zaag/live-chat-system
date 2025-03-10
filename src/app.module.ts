import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ Import ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentModule } from './modules/agents/agent.module';
import { ChatGateway } from './modules/chat/chat.gateway';
import { ChatModule } from './modules/chat/chat.module';
import { NatsModule } from './modules/nats/nats.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // ✅ Loads .env globally
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule], // ✅ Ensure ConfigModule is loaded
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true, // ⚠️ Set false in production, use migrations instead
            }),
        }),
        ChatModule,
        UserModule,
        NatsModule,
        AgentModule,
    ],
    providers: [ChatGateway],
})
export class AppModule {}
