import { Router, Request, Response } from 'express'
import { UsuarioRepository } from '@/repositories/UsuarioRepository'
import { authenticate } from '@/middlewares/authenticate'

const router = Router()
const usuarioRepo = new UsuarioRepository()

// GET /api/admin/users — admin only
router.get('/users', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Solo administradores' })
      return
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const search = req.query.search as string | undefined

    const { data: usuarios, total } = await usuarioRepo.list(page, limit, search)

    res.json({
      data: usuarios.map(u => ({
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
    })
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

// GET /api/admin/users/:id — admin only
router.get('/users/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Solo administradores' })
      return
    }

    const usuario = await usuarioRepo.findById(req.params.id)
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({
      id: usuario.id,
      email: usuario.email,
      name: usuario.name,
      role: usuario.role,
      negocioId: usuario.negocioId,
      createdAt: usuario.createdAt,
    })
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

// PUT /api/admin/users/:id — admin only
router.put('/users/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Solo administradores' })
      return
    }

    const { name, role } = req.body as { name?: string; role?: string }

    if (role && !['admin', 'owner'].includes(role)) {
      res.status(400).json({ error: 'Rol inválido' })
      return
    }

    const updated = await usuarioRepo.update(req.params.id, { name, role })
    if (!updated) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      createdAt: updated.createdAt,
    })
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

// DELETE /api/admin/users/:id — admin only
router.delete('/users/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Solo administradores' })
      return
    }

    // No permitir que un admin se elimine a sí mismo
    if (req.params.id === req.user!.userId) {
      res.status(400).json({ error: 'No puedes eliminarte a ti mismo' })
      return
    }

    const deleted = await usuarioRepo.delete(req.params.id)
    if (!deleted) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

export default router