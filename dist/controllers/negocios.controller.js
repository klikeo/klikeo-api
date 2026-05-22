"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStatsController = exports.getBussinessCahtsController = exports.trainWhatsappAgentController = exports.updateBussinesController = exports.createBussinesController = exports.getBussinesByIdController = exports.getBussinesController = void 0;
const ChatSessionRepository_1 = require("../repositories/ChatSessionRepository");
const NegocioRepository_1 = require("../repositories/NegocioRepository");
const CreateNegocioUseCase_1 = require("../use-cases/negocios/CreateNegocioUseCase");
const GetNegocioUseCase_1 = require("../use-cases/negocios/GetNegocioUseCase");
const ListNegociosUseCase_1 = require("../use-cases/negocios/ListNegociosUseCase");
const UpdateNegocioUseCase_1 = require("../use-cases/negocios/UpdateNegocioUseCase");
const negocioRepo = new NegocioRepository_1.NegocioRepository();
const chatSessionRepo = new ChatSessionRepository_1.ChatSessionRepository();
const createUseCase = new CreateNegocioUseCase_1.CreateNegocioUseCase(negocioRepo);
const getUseCase = new GetNegocioUseCase_1.GetNegocioUseCase(negocioRepo);
const updateUseCase = new UpdateNegocioUseCase_1.UpdateNegocioUseCase(negocioRepo);
const listUseCase = new ListNegociosUseCase_1.ListNegociosUseCase(negocioRepo);
// GET /api/negocios — public
const getBussinesController = async (req, res) => {
    try {
        const { search, city, category, page, limit } = req.query;
        const result = await listUseCase.execute({
            search: search,
            city: city,
            category: category,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        res.json(result);
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinesController = getBussinesController;
// GET /api/negocios/:id — public
const getBussinesByIdController = async (req, res) => {
    try {
        const negocio = await getUseCase.execute(req.params.id);
        res.json(negocio);
    }
    catch (err) {
        if (err instanceof Error && err.message === "NEGOCIO_NOT_FOUND") {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinesByIdController = getBussinesByIdController;
// POST /api/negocios — owner only
const createBussinesController = async (req, res) => {
    try {
        const negocio = await createUseCase.execute(req.body, req.user.userId);
        res.status(201).json(negocio);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.createBussinesController = createBussinesController;
// PUT /api/negocios/:id — owner only (must own the negocio)
const updateBussinesController = async (req, res) => {
    try {
        const negocio = await updateUseCase.execute(req.params.id, req.body, req.user.userId);
        res.json(negocio);
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.message === "NEGOCIO_NOT_FOUND") {
                res.status(404).json({ error: "Negocio no encontrado" });
                return;
            }
            if (err.message === "FORBIDDEN") {
                res
                    .status(403)
                    .json({ error: "No tienes permiso para modificar este negocio" });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.updateBussinesController = updateBussinesController;
// POST /api/negocios/:id/chat/entrenar — saves training data (owner only)
const trainWhatsappAgentController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findById(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const { trainingData } = req.body;
        if (typeof trainingData !== "string") {
            res.status(400).json({ error: "trainingData es requerido" });
            return;
        }
        await negocioRepo.update(req.params.id, { trainingData });
        res.json({ message: "Chatbot entrenado exitosamente" });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.trainWhatsappAgentController = trainWhatsappAgentController;
// GET /api/negocios/:id/chats — lists chat sessions for the owner
const getBussinessCahtsController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findById(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const result = await chatSessionRepo.findByNegocioId(req.params.id, page, limit);
        res.json(result);
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinessCahtsController = getBussinessCahtsController;
// GET /api/admin/stats — admin only
const getAdminStatsController = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ error: "Solo administradores" });
            return;
        }
        const { data: negocios } = await listUseCase.execute({ limit: 1000 });
        const allChats = await chatSessionRepo.list(1, 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chatsHoy = allChats.data.filter((c) => new Date(c.createdAt) >= today).length;
        const negociosActivos = negocios.filter((n) => n.isActive).length;
        const negociosConChatbot = negocios.filter((n) => n.trainingData && n.trainingData.length > 0).length;
        res.json({
            totalNegocios: negocios.length,
            negociosActivos,
            negociosConChatbot,
            totalChats: allChats.total,
            chatsHoy,
        });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getAdminStatsController = getAdminStatsController;
