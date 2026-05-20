"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RegisterUseCase_1 = require("@/use-cases/auth/RegisterUseCase");
const LoginUseCase_1 = require("@/use-cases/auth/LoginUseCase");
const UsuarioRepository_1 = require("@/repositories/UsuarioRepository");
const authenticate_1 = require("@/middlewares/authenticate");
const router = (0, express_1.Router)();
const usuarioRepo = new UsuarioRepository_1.UsuarioRepository();
const registerUseCase = new RegisterUseCase_1.RegisterUseCase(usuarioRepo);
const loginUseCase = new LoginUseCase_1.LoginUseCase(usuarioRepo);
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
router.post('/register', async (req, res) => {
    try {
        const user = await registerUseCase.execute(req.body);
        res.status(201).json({ user });
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.message === 'EMAIL_EXISTS') {
                res.status(409).json({ error: 'El email ya está registrado' });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: 'Error interno' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const result = await loginUseCase.execute(req.body);
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
        res.json({ user: result.user, accessToken: result.accessToken });
    }
    catch (err) {
        if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        res.status(500).json({ error: 'Error interno' });
    }
});
router.post('/refresh', async (req, res) => {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
        res.status(401).json({ error: 'No hay refresh token' });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
        res.status(500).json({ error: 'Server misconfigured' });
        return;
    }
    try {
        const hashedToken = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const usuario = await usuarioRepo.findByRefreshToken(hashedToken);
        if (!usuario) {
            res.status(401).json({ error: 'Refresh token inválido' });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: usuario.id, role: usuario.role }, jwtSecret, { expiresIn: '15m' });
        res.json({ accessToken });
    }
    catch {
        res.status(401).json({ error: 'Refresh token inválido' });
    }
});
router.post('/logout', authenticate_1.authenticate, async (req, res) => {
    try {
        if (req.user) {
            await usuarioRepo.updateRefreshToken(req.user.userId, null);
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Sesión cerrada' });
    }
    catch {
        res.status(500).json({ error: 'Error interno' });
    }
});
exports.default = router;
