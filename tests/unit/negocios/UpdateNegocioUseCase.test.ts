import { UpdateNegocioUseCase } from "../../../src/use-cases/negocios/UpdateNegocioUseCase"
import { INegocioRepository } from "../../../src/repositories/interfaces/INegocioRepository"
import { NegocioDomain } from "../../../src/domain/Negocio"

const baseNegocio: NegocioDomain = {
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

function makeMockRepo(
  negocio: NegocioDomain | null = baseNegocio,
): INegocioRepository {
  return {
    findById: jest.fn().mockResolvedValue(negocio),
    findBySlug: jest.fn().mockResolvedValue(null),
    findByIdOrSlug: jest.fn().mockResolvedValue(negocio),
    findByOwnerId: jest.fn().mockResolvedValue(null),
    findByWhatsappPhoneId: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest
      .fn()
      .mockResolvedValue({ ...baseNegocio, name: "Nuevo Nombre" }),
    list: jest.fn(),
  }
}

describe("UpdateNegocioUseCase", () => {
  it("updates negocio when owner matches", async () => {
    const repo = makeMockRepo()
    const useCase = new UpdateNegocioUseCase(repo)

    const result = await useCase.execute(
      "neg-1",
      { name: "Nuevo Nombre" },
      "owner-1",
    )

    expect(result.name).toBe("Nuevo Nombre")
    expect(repo.update).toHaveBeenCalledWith("neg-1", { name: "Nuevo Nombre" })
  })

  it("throws FORBIDDEN if owner does not match", async () => {
    const repo = makeMockRepo()
    const useCase = new UpdateNegocioUseCase(repo)

    await expect(
      useCase.execute("neg-1", { name: "Hack" }, "wrong-owner"),
    ).rejects.toThrow("FORBIDDEN")
  })

  it("throws NEGOCIO_NOT_FOUND if negocio does not exist", async () => {
    const repo = makeMockRepo(null)
    const useCase = new UpdateNegocioUseCase(repo)

    await expect(
      useCase.execute("neg-999", { name: "Test" }, "owner-1"),
    ).rejects.toThrow("NEGOCIO_NOT_FOUND")
  })

  it("throws on invalid category", async () => {
    const repo = makeMockRepo()
    const useCase = new UpdateNegocioUseCase(repo)

    await expect(
      useCase.execute("neg-1", { category: "INVALIDA" }, "owner-1"),
    ).rejects.toThrow("Categoría inválida")
  })
})
