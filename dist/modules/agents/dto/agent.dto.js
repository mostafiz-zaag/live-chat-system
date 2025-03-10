"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentStatusDto = void 0;
const class_validator_1 = require("class-validator");
class AgentStatusDto {
}
exports.AgentStatusDto = AgentStatusDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Agent ID is required.' }),
    __metadata("design:type", String)
], AgentStatusDto.prototype, "agentId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required.' }),
    (0, class_validator_1.Length)(3, 50, { message: 'Name must be between 3 and 50 characters.' }),
    __metadata("design:type", String)
], AgentStatusDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Status is required.' }),
    (0, class_validator_1.IsEnum)(['ready', 'busy', 'offline'], {
        message: 'Status must be "ready", "busy", or "offline".',
    }),
    __metadata("design:type", String)
], AgentStatusDto.prototype, "status", void 0);
//# sourceMappingURL=agent.dto.js.map