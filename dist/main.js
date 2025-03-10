"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const dotenv = require("dotenv");
const app_module_1 = require("./app.module");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(3000, '0.0.0.0');
    console.log(`🚀 WebSocket server running on ws://localhost:3000`);
}
bootstrap();
//# sourceMappingURL=main.js.map