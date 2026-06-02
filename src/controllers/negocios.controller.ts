import { ChatSessionRepository } from "../repositories/ChatSessionRepository"
import { NegocioRepository } from "../repositories/NegocioRepository"
import { CreateNegocioUseCase } from "../use-cases/negocios/CreateNegocioUseCase"
import { GetNegocioByOwnerUseCase } from "../use-cases/negocios/GetNegocioByOwnerUseCase"
import { GetNegocioUseCase } from "../use-cases/negocios/GetNegocioUseCase"
import { ListNegociosUseCase } from "../use-cases/negocios/ListNegociosUseCase"
import { UpdateNegocioUseCase } from "../use-cases/negocios/UpdateNegocioUseCase"
import { ChatWithNegocioUseCase } from "../use-cases/chat/ChatWithNegocioUseCase"
import { DeepSeekService } from "../services/DeepSeekService"
import { Request, Response } from "express"

const negocioRepo = new NegocioRepository()
const chatSessionRepo = new ChatSessionRepository()
const createUseCase = new CreateNegocioUseCase(negocioRepo)
const getUseCase = new GetNegocioUseCase(negocioRepo)
const getByOwnerUseCase = new GetNegocioByOwnerUseCase(negocioRepo)
const updateUseCase = new UpdateNegocioUseCase(negocioRepo)
const listUseCase = new ListNegociosUseCase(negocioRepo)
const chatWithNegocioUseCase = new ChatWithNegocioUseCase(negocioRepo, new DeepSeekService())

// GET /api/negocios — public
export const getBussinesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, city, category, page, limit } = req.query
    const result = await listUseCase.execute({
      search: search as string | undefined,
      city: city as string | undefined,
      category: category as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json(result)
  } catch {
    res.status(500).json({ error: "Error interno" })
  }
}

// GET /api/negocios/:id — public
export const getBussinesByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await getUseCase.execute(req.params.id)
    res.json(negocio)
  } catch (err) {
    if (err instanceof Error && err.message === "NEGOCIO_NOT_FOUND") {
      res.status(404).json({ error: "Negocio no encontrado" })
      return
    }
    res.status(500).json({ error: "Error interno" })
  }
}

// GET /api/negocios/me — owner only
export const getBussinesByOwnerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await getByOwnerUseCase.execute(req.user!.userId)
    res.json(negocio)
  } catch (err) {
    if (err instanceof Error && err.message === "NEGOCIO_NOT_FOUND") {
      res.status(404).json({ error: "No tienes un negocio registrado" })
      return
    }
    res.status(500).json({ error: "Error interno" })
  }
}

// POST /api/negocios — owner only
export const createBussinesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await createUseCase.execute(req.body, req.user!.userId)
    res.status(201).json(negocio)
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Error interno" })
  }
}

// PUT /api/negocios/:id — owner only (must own the negocio)
export const updateBussinesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await updateUseCase.execute(
      req.params.id,
      req.body,
      req.user!.userId,
    )
    res.json(negocio)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NEGOCIO_NOT_FOUND") {
        res.status(404).json({ error: "Negocio no encontrado" })
        return
      }
      if (err.message === "FORBIDDEN") {
        res
          .status(403)
          .json({ error: "No tienes permiso para modificar este negocio" })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Error interno" })
  }
}

// POST /api/negocios/:id/chat/entrenar — saves training data (owner only)
export const trainWhatsappAgentController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await negocioRepo.findByIdOrSlug(req.params.id)
    if (!negocio) {
      res.status(404).json({ error: "Negocio no encontrado" })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: "No tienes permiso" })
      return
    }
    const { trainingData } = req.body as { trainingData: string }
    if (typeof trainingData !== "string") {
      res.status(400).json({ error: "trainingData es requerido" })
      return
    }
    await negocioRepo.update(negocio.id, { trainingData })
    res.json({ message: "Chatbot entrenado exitosamente" })
  } catch {
    res.status(500).json({ error: "Error interno" })
  }
}

// POST /api/negocios/:id/chat — public conversational chat using DeepSeek
export const chatWithBussinesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const messages = req.body?.messages
    if (!Array.isArray(messages) || !messages.every(
      (m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    )) {
      res.status(400).json({ error: 'messages debe ser un arreglo de objetos { role, content }' })
      return
    }

    const reply = await chatWithNegocioUseCase.execute(req.params.id, messages)
    res.json({ reply })
  } catch (err) {
    if (err instanceof Error && err.message === 'NEGOCIO_NOT_FOUND') {
      res.status(404).json({ error: 'Negocio no encontrado' })
      return
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' })
  }
}

// GET /api/negocios/:id/chats — lists chat sessions for the owner
export const getBussinessCahtsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const negocio = await negocioRepo.findByIdOrSlug(req.params.id)
    if (!negocio) {
      res.status(404).json({ error: "Negocio no encontrado" })
      return
    }
    if (negocio.ownerId !== req.user!.userId) {
      res.status(403).json({ error: "No tienes permiso" })
      return
    }
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const result = await chatSessionRepo.findByNegocioId(
      negocio.id,
      page,
      limit,
    )
    res.json(result)
  } catch {
    res.status(500).json({ error: "Error interno" })
  }
}

// GET /api/admin/stats — admin only
export const getAdminStatsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user!.role !== "admin") {
      res.status(403).json({ error: "Solo administradores" })
      return
    }
    const { data: negocios } = await listUseCase.execute({ limit: 1000 })
    const allChats = await chatSessionRepo.list(1, 1000)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const chatsHoy = allChats.data.filter(
      (c) => new Date(c.createdAt) >= today,
    ).length

    const negociosActivos = negocios.filter((n) => n.isActive).length
    const negociosConChatbot = negocios.filter(
      (n) => n.trainingData && n.trainingData.length > 0,
    ).length

    res.json({
      totalNegocios: negocios.length,
      negociosActivos,
      negociosConChatbot,
      totalChats: allChats.total,
      chatsHoy,
    })
  } catch {
    res.status(500).json({ error: "Error interno" })
  }
}
