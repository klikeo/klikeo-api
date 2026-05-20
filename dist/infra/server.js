"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./db");
const routes_1 = require("./routes");
function createApp() {
    const app = (0, express_1.default)();
    const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
    console.log('[CORS] Origin configurado:', corsOrigin);
    // CORS: usar dominio exacto para cookies/credentials
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', corsOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    (0, routes_1.registerRoutes)(app);
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    return app;
}
async function main() {
    const app = createApp();
    const PORT = process.env.PORT ?? 3001;
    app.listen(PORT, () => {
        console.log(`API running on http://localhost:${PORT}`);
    });
    await (0, db_1.connectDB)();
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
