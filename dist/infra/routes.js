"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
// import authRouter from '@/controllers/auth.controller'
// import negociosRouter from '@/controllers/negocios.controller'
// import webhooksRouter from '@/controllers/webhooks.controller'
const admin_controller_1 = __importDefault(require("@/controllers/admin.controller"));
function registerRoutes(app) {
    // app.use('/api/auth', authRouter)
    // app.use('/api/negocios', negociosRouter)
    // app.use('/api/webhooks', webhooksRouter)
    app.use("/api/admin", admin_controller_1.default);
}
