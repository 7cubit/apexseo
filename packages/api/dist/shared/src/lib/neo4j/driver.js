"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driver = exports.DATABASE = void 0;
exports.closeDriver = closeDriver;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;
exports.DATABASE = process.env.NEO4J_DATABASE || 'neo4j';
if (!URI || !USER || !PASSWORD) {
    console.warn("Missing Neo4j environment variables. Neo4j features will be disabled.");
}
exports.driver = (URI && USER && PASSWORD)
    ? neo4j_driver_1.default.driver(URI, neo4j_driver_1.default.auth.basic(USER, PASSWORD))
    : null;
async function closeDriver() {
    if (exports.driver) {
        await exports.driver.close();
    }
}
