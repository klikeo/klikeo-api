import { RegisterUseCase } from '@/use-cases/auth/RegisterUseCase'
import { IUsuarioRepository } from '@/repositories/interfaces/IUsuarioRepository'
import { UsuarioDomain } from '@/domain/Usuario'

function makeMockRepo(overrides: Partial<IUsuarioRepository> = {}): IUsuarioRepository {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'owner',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UsuarioDomain),
    updateRefreshToken: jest.fn().mockResolvedValue(undefined),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    list: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    update: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(false),
    ...overrides,
  }
}

describe('RegisterUseCase', () => {
  it('creates a new user and returns public data', async () => {
    const repo = makeMockRepo()
    const useCase = new RegisterUseCase(repo)

    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'password123',
      name: 'Test User',
    })

    expect(result.email).toBe('test@test.com')
    expect(result.role).toBe('owner')
    expect(repo.create).toHaveBeenCalledTimes(1)
  })

  it('throws EMAIL_EXISTS if email is already taken', async () => {
    const repo = makeMockRepo({
      findByEmail: jest.fn().mockResolvedValue({ id: 'existing' }),
    })
    const useCase = new RegisterUseCase(repo)

    await expect(
      useCase.execute({ email: 'taken@test.com', password: 'password123', name: 'Test' })
    ).rejects.toThrow('EMAIL_EXISTS')
  })

  it('throws if password is less than 8 characters', async () => {
    const repo = makeMockRepo()
    const useCase = new RegisterUseCase(repo)

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'short', name: 'Test' })
    ).rejects.toThrow('al menos 8 caracteres')
  })

  it('normalizes email to lowercase', async () => {
    const repo = makeMockRepo()
    const useCase = new RegisterUseCase(repo)

    await useCase.execute({ email: 'USER@TEST.COM', password: 'password123', name: 'Test' })

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@test.com' })
    )
  })
})
