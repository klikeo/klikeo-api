"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class RegisterUseCase {
    usuarioRepo;
    constructor(usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }
    async execute(input) {
        const { email, password, name } = input;
        if (!email || !password || !name) {
            throw new Error('Todos los campos son requeridos');
        }
        if (password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
        const existing = await this.usuarioRepo.findByEmail(email.toLowerCase());
        if (existing) {
            throw new Error('EMAIL_EXISTS');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const usuario = await this.usuarioRepo.create({
            email: email.toLowerCase(),
            name,
            passwordHash,
        });
        return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.name,
            role: usuario.role,
        };
    }
}
exports.RegisterUseCase = RegisterUseCase;
