import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config(); // ✅ Load environment variables

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ✅ Enable global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // ✅ Strip unknown properties from requests
            forbidNonWhitelisted: true, // ✅ Reject requests with unknown properties
            transform: true, // ✅ Automatically transform payloads into DTO instances
        }),
    );

    await app.listen(3000, '0.0.0.0'); // Bind to all interfaces
    console.log(`🚀 WebSocket server running on ws://localhost:3000`);
}

bootstrap();
