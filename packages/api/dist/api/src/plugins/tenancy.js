"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.decorate("tenancy", async function (request, reply) {
        const { user } = request;
        const projectId = request.params.id || request.query.projectId;
        if (!user) {
            reply.status(401).send({ error: "Unauthorized" });
            return;
        }
        // Mock tenancy check: Ensure user belongs to the org that owns the project
        // In real app, fetch project from DB and check orgId
        // For MVP, we'll assume if they have a token, they are good, but we attach projectId to request
        request.log.info(`User ${user.id} accessing project ${projectId}`);
    });
});
