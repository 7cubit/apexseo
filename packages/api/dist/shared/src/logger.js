"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTelemetry = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    defaultMeta: { service: 'apexseo' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
        }),
    ],
});
// OpenTelemetry stub
const initTelemetry = (serviceName) => {
    exports.logger.info(`Initializing OpenTelemetry for ${serviceName}...`);
    // Stub for OTel SDK initialization
};
exports.initTelemetry = initTelemetry;
