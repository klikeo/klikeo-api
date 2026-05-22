import bcrypt from "bcryptjs"
import { LoginUseCase } from "../../../src/use-cases/auth/LoginUseCase"
import { IUsuarioRepository } from "../../../src//repositories/interfaces/IUsuarioRepository"
import { UsuarioDomain } from "../../../src/domain/Usuario"

const JWT_SECRET = "test-secret"
const JWT_REFRESH_SECRET = "test-refresh-secret"

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET
  process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET
})

async function makeMockUser(password: string): Promise<UsuarioDomain> {
  return {
    id: "user-1",
    email: "test@test.com",
    name: "Test User",
    role: "owner",
    passwordHash: await bcrypt.hash(password, 1),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function makeMockRepo(user: UsuarioDomain | null): IUsuarioRepository {
  return {
    findByEmail: jest.fn().mockResolvedValue(user),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    updateRefreshToken: jest.fn().mockResolvedValue(undefined),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    list: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    update: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(false),
  }
}

describe("LoginUseCase", () => {
  it("returns accessToken and refreshToken on valid credentials", async () => {
    const user = await makeMockUser("password123")
    const repo = makeMockRepo(user)
    const useCase = new LoginUseCase(repo)

    const result = await useCase.execute({
      email: "test@test.com",
      password: "password123",
    })

    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.user.email).toBe("test@test.com")
    expect(repo.updateRefreshToken).toHaveBeenCalledWith(
      "user-1",
      expect.any(String),
    )
  })

  it("throws INVALID_CREDENTIALS if user not found", async () => {
    const repo = makeMockRepo(null)
    const useCase = new LoginUseCase(repo)

    await expect(
      useCase.execute({ email: "unknown@test.com", password: "password123" }),
    ).rejects.toThrow("INVALID_CREDENTIALS")
  })

  it("throws INVALID_CREDENTIALS if password is wrong", async () => {
    const user = await makeMockUser("correct-password")
    const repo = makeMockRepo(user)
    const useCase = new LoginUseCase(repo)

    await expect(
      useCase.execute({ email: "test@test.com", password: "wrong-password" }),
    ).rejects.toThrow("INVALID_CREDENTIALS")
  })
})
