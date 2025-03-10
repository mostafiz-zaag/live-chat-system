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
exports.UploadFileDto = exports.SenderType = void 0;
const class_validator_1 = require("class-validator");
var SenderType;
(function (SenderType) {
    SenderType["USER"] = "user";
    SenderType["AGENT"] = "agent";
})(SenderType || (exports.SenderType = SenderType = {}));
class UploadFileDto {
}
exports.UploadFileDto = UploadFileDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Room ID is required.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Room ID must be a valid UUID.' }),
    __metadata("design:type", String)
], UploadFileDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Sender type is required.' }),
    (0, class_validator_1.IsEnum)(SenderType, {
        message: 'Sender type must be either "user" or "agent".',
    }),
    __metadata("design:type", String)
], UploadFileDto.prototype, "senderType", void 0);
//# sourceMappingURL=upload-file.dto.js.map