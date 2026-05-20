"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
class LoginUseCase {
    usuarioRepo;
    constructor(usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }
    async execute(input) {
        const { email, password } = input;
        const usuario = await this.usuarioRepo.findByEmail(email.toLowerCase());
        if (!usuario) {
            throw new Error('INVALID_CREDENTIALS');
        }
        const valid = await bcryptjs_1.default.compare(password, usuario.passwordHash);
        if (!valid) {
            throw new Error('INVALID_CREDENTIALS');
        }
        const jwtSecret = process.env.JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtSecret || !jwtRefreshSecret) {
            throw new Error('JWT secrets not configured');
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: usuario.id, role: usuario.role }, jwtSecret, { expiresIn: '15m' });
        const rawRefresh = crypto_1.default.randomBytes(64).toString('hex');
        const hashedRefresh = crypto_1.default.createHash('sha256').update(rawRefresh).digest('hex');
        await this.usuarioRepo.updateRefreshToken(usuario.id, hashedRefresh);
        return {
            accessToken,
            refreshToken: rawRefresh,
            user: {
                id: usuario.id,
                email: usuario.email,
                name: usuario.name,
                role: usuario.role,
            },
        };
    }
}
exports.LoginUseCase = LoginUseCase;
