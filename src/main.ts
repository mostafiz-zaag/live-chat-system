import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000, '0.0.0.0'); // Bind to all interfaces
    console.log(`🚀 WebSocket server running on ws://localhost:3000`);
}

bootstrap();
