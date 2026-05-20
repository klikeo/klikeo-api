import { BUSINESS_CATEGORIES } from '@/constants/categories'
import type { Negocio } from '@/types/Negocio'
import type { Usuario } from '@/types/Usuario'
import type { ChatSession } from '@/types/ChatSession'

describe('@klikeo/shared', () => {
  it('exports BUSINESS_CATEGORIES with at least 5 categories', () => {
    expect(BUSINESS_CATEGORIES.length).toBeGreaterThanOrEqual(5)
    expect(BUSINESS_CATEGORIES).toContain('alimentos')
    expect(BUSINESS_CATEGORIES).toContain('salud')
  })

  it('Negocio type has required fields', () => {
    const negocio: Negocio = {
      _id: '123',
      name: 'Panadería El Sol',
      category: 'alimentos',
      city: 'Bogotá',
      whatsappNumber: '+573001234567',
      ownerId: 'user-123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(negocio.name).toBe('Panadería El Sol')
  })

  it('Usuario type has role field', () => {
    const usuario: Usuario = {
      _id: 'u1',
      email: 'test@test.com',
      name: 'Carlos',
      role: 'owner',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(usuario.role).toBe('owner')
  })

  it('ChatSession type has historial array', () => {
    const session: ChatSession = {
      _id: 's1',
      negocioId: 'n1',
      clientePhone: '+573001234567',
      estado: 'active',
      historial: [{ role: 'user', content: 'Hola', timestamp: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(session.historial).toHaveLength(1)
  })
})
