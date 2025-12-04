"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.register(jwt_1.default, {
        secret: process.env.NEXTAUTH_SECRET || 'supersecret', // Should match NextAuth secret
    });
    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
            // RBAC Logic could go here if we passed roles to authenticate()
            // For now, we just verify the token.
            // Future: fastify.authenticate = (role) => ...
        }
        catch (err) {
            reply.send(err);
        }
    });
    // Add a specific RBAC decorator
    fastify.decorate("rbac", (requiredPermission) => {
        return async (request, reply) => {
            try {
                await request.jwtVerify();
                const user = request.user;
                // TODO: Import hasPermission from shared and check
                // const { hasPermission, UserRole } = require('@apexseo/shared');
                // if (!hasPermission(user.role, requiredPermission)) {
                //     throw new Error('Forbidden');
                // }
            }
            catch (err) {
                reply.send(err);
            }
        };
    });
});
