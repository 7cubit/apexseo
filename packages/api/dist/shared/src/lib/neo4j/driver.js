"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driver = exports.getDriver = exports.DATABASE = void 0;
exports.closeDriver = closeDriver;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
exports.DATABASE = process.env.NEO4J_DATABASE || 'neo4j';
let driverInstance = null;
const getDriver = () => {
    if (!driverInstance) {
        const URI = process.env.NEO4J_URI;
        const USER = process.env.NEO4J_USER;
        const PASSWORD = process.env.NEO4J_PASSWORD;
        if (!URI || !USER || !PASSWORD) {
            console.warn("Missing Neo4j environment variables. Neo4j features will be disabled.");
            return null;
        }
        driverInstance = neo4j_driver_1.default.driver(URI, neo4j_driver_1.default.auth.basic(USER, PASSWORD));
    }
    return driverInstance;
};
exports.getDriver = getDriver;
exports.driver = (0, exports.getDriver)(); // For backward compatibility, but might still be null if env vars missing at load time
async function closeDriver() {
    if (driverInstance) {
        await driverInstance.close();
        driverInstance = null;
    }
}
