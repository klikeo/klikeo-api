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
// import { registerRoutes } from "./routes"
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const negocios_routes_1 = __importDefault(require("../routes/negocios.routes"));
const webhhoks_routes_1 = __importDefault(require("../routes/webhhoks.routes"));
const admin_routes_1 = __importDefault(require("../routes/admin.routes"));
const cors_1 = __importDefault(require("cors"));
function createApp() {
    const app = (0, express_1.default)();
    const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
    console.log("[CORS] Origin configurado:", corsOrigin);
    // CORS: usar dominio exacto para cookies/credentials
    app.use((0, cors_1.default)({
        origin: corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
        ],
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    // registerRoutes(app)
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/negocios", negocios_routes_1.default);
    app.use("/api/webhooks", webhhoks_routes_1.default);
    app.use("/api/admin", admin_routes_1.default);
    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
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
    console.error("Fatal error:", err);
    process.exit(1);
});
