import { CreateNegocioUseCase } from "../../../src/use-cases/negocios/CreateNegocioUseCase"
import { INegocioRepository } from "../../../src/repositories/interfaces/INegocioRepository"
import { NegocioDomain } from "../../../src/domain/Negocio"

const mockNegocio: NegocioDomain = {
  id: "neg-1",
  name: "Panadería El Sol",
  category: "alimentos",
  city: "Bogotá",
  whatsappNumber: "+573001234567",
  ownerId: "owner-1",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function makeMockRepo(): INegocioRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findBySlug: jest.fn().mockResolvedValue(null),
    findByIdOrSlug: jest.fn().mockResolvedValue(null),
    findByOwnerId: jest.fn().mockResolvedValue(null),
    findByWhatsappPhoneId: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockNegocio),
    update: jest.fn().mockResolvedValue(null),
    list: jest
      .fn()
      .mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 }),
  }
}

describe("CreateNegocioUseCase", () => {
  const validInput = {
    name: "Panadería El Sol",
    category: "alimentos",
    city: "Bogotá",
    whatsappNumber: "+573001234567",
  }

  it("creates negocio with valid input", async () => {
    const repo = makeMockRepo()
    const useCase = new CreateNegocioUseCase(repo)

    const result = await useCase.execute(validInput, "owner-1")

    expect(result.name).toBe("Panadería El Sol")
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: "owner-1" }),
    )
  })

  it("throws if name is less than 2 characters", async () => {
    const repo = makeMockRepo()
    const useCase = new CreateNegocioUseCase(repo)

    await expect(
      useCase.execute({ ...validInput, name: "A" }, "owner-1"),
    ).rejects.toThrow("al menos 2 caracteres")
  })

  it("throws if category is invalid", async () => {
    const repo = makeMockRepo()
    const useCase = new CreateNegocioUseCase(repo)

    await expect(
      useCase.execute({ ...validInput, category: "INVALIDA" }, "owner-1"),
    ).rejects.toThrow("Categoría inválida")
  })

  it("throws if city is missing", async () => {
    const repo = makeMockRepo()
    const useCase = new CreateNegocioUseCase(repo)

    await expect(
      useCase.execute({ ...validInput, city: "" }, "owner-1"),
    ).rejects.toThrow("ciudad es requerida")
  })
})
