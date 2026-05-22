"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByIdController = exports.updateUserByIdController = exports.getUserByIdController = exports.getUsersController = void 0;
const UsuarioRepository_1 = require("../repositories/UsuarioRepository");
const usuarioRepo = new UsuarioRepository_1.UsuarioRepository();
// GET /api/admin/users — admin only
const getUsersController = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ error: "Solo administradores" });
            return;
        }
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const search = req.query.search;
        const { data: usuarios, total } = await usuarioRepo.list(page, limit, search);
        res.json({
            data: usuarios.map((u) => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                negocioId: u.negocioId,
                createdAt: u.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getUsersController = getUsersController;
// GET /api/admin/users/:id — admin only
const getUserByIdController = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ error: "Solo administradores" });
            return;
        }
        const usuario = await usuarioRepo.findById(req.params.id);
        if (!usuario) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.json({
            id: usuario.id,
            email: usuario.email,
            name: usuario.name,
            role: usuario.role,
            negocioId: usuario.negocioId,
            createdAt: usuario.createdAt,
        });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getUserByIdController = getUserByIdController;
// PUT /api/admin/users/:id — admin only
const updateUserByIdController = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ error: "Solo administradores" });
            return;
        }
        const { name, role } = req.body;
        if (role && !["admin", "owner"].includes(role)) {
            res.status(400).json({ error: "Rol inválido" });
            return;
        }
        const updated = await usuarioRepo.update(req.params.id, { name, role });
        if (!updated) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.json({
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
            createdAt: updated.createdAt,
        });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.updateUserByIdController = updateUserByIdController;
// DELETE /api/admin/users/:id — admin only
const deleteUserByIdController = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ error: "Solo administradores" });
            return;
        }
        // No permitir que un admin se elimine a sí mismo
        if (req.params.id === req.user.userId) {
            res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
            return;
        }
        const deleted = await usuarioRepo.delete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.json({ message: "Usuario eliminado exitosamente" });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.deleteUserByIdController = deleteUserByIdController;
