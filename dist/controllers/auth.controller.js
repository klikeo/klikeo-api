"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = exports.refreshController = exports.loginController = exports.registerController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RegisterUseCase_1 = require("../use-cases/auth/RegisterUseCase");
const LoginUseCase_1 = require("../use-cases/auth/LoginUseCase");
const UsuarioRepository_1 = require("../repositories/UsuarioRepository");
const usuarioRepo = new UsuarioRepository_1.UsuarioRepository();
const registerUseCase = new RegisterUseCase_1.RegisterUseCase(usuarioRepo);
const loginUseCase = new LoginUseCase_1.LoginUseCase(usuarioRepo);
function getCookieOpts() {
    // prefer explicit env var; fall back to production domain only when not empty
    const rawDomain = process.env.COOKIE_DOMAIN?.trim();
    const domain = rawDomain && rawDomain.length > 0 ? rawDomain : (process.env.NODE_ENV === 'production' ? 'klikeo.pro' : undefined);
    const secure = process.env.NODE_ENV === 'production';
    const sameSite = secure ? "none" : "lax";
    const opts = {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    if (domain) {
        // basic validation: must not contain spaces or protocol
        if (/^[A-Za-z0-9.-]+$/.test(domain)) {
            opts.domain = domain;
        }
    }
    return opts;
}
const registerController = async (req, res) => {
    try {
        const user = await registerUseCase.execute(req.body);
        res.status(201).json({ user });
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.message === "EMAIL_EXISTS") {
                res.status(409).json({ error: "El email ya está registrado" });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    try {
        const result = await loginUseCase.execute(req.body);
        const COOKIE_OPTS = getCookieOpts();
        try {
            res.cookie("refreshToken", result.refreshToken, COOKIE_OPTS);
        }
        catch (err) {
            // preserve previous behavior but give more debug info in logs
            console.error('Failed setting refresh cookie, opts=', COOKIE_OPTS, 'err=', err);
            throw err;
        }
        res.json({ user: result.user, accessToken: result.accessToken });
    }
    catch (err) {
        if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
            res.status(401).json({ error: "Credenciales inválidas" });
            return;
        }
        res.status(500).json({ message: "Error interno", error: err instanceof Error ? err.message : "Unknown error" });
    }
};
exports.loginController = loginController;
const refreshController = async (req, res) => {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
        res.status(401).json({ error: "No hay refresh token" });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
        res.status(500).json({ error: "Server misconfigured" });
        return;
    }
    try {
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        const usuario = await usuarioRepo.findByRefreshToken(hashedToken);
        if (!usuario) {
            res.status(401).json({ error: "Refresh token inválido" });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: usuario.id, role: usuario.role }, jwtSecret, { expiresIn: "15m" });
        res.json({ accessToken });
    }
    catch {
        res.status(401).json({ error: "Refresh token inválido" });
    }
};
exports.refreshController = refreshController;
const logoutController = async (req, res) => {
    try {
        if (req.user) {
            await usuarioRepo.updateRefreshToken(req.user.userId, null);
        }
        // clear with same options to ensure cookie is removed in client
        const COOKIE_OPTS = getCookieOpts();
        res.clearCookie("refreshToken", COOKIE_OPTS);
        res.json({ message: "Sesión cerrada" });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.logoutController = logoutController;
