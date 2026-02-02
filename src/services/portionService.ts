import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

function calculatePortionCost(
  ingredientCost: Decimal,
  ingredientWeightG: number,
  portionWeightG: number,
): Decimal {
  // custo da porção = (custo do ingredient / peso do ingredient) * peso da porção
  // Ex: R$ 24 / 1000g * 100g = R$ 2.40
  return ingredientCost
    .div(new Decimal(ingredientWeightG))
    .mul(new Decimal(portionWeightG));
}

export class PortionService {
  async create(ingredientId: number, name: string, weightG: number) {
    // 1) Busca o ingrediente para validar e pegar o custo
    const ingredient = await prisma.ingredient.findUniqueOrThrow({
      where: { id: ingredientId },
    });

    // 2) Calcula o custo da porção
    const cost = calculatePortionCost(
      ingredient.cost as Decimal,
      ingredient.weightG,
      weightG,
    );

    // 3) Cria a porção
    return prisma.portion.create({
      data: {
        ingredientId,
        name: name.trim(),
        weightG,
        cost,
      },
    });
  }

  async findAll() {
    return prisma.portion.findMany({
      include: { ingredient: true },
    });
  }

  async findById(id: number) {
    return prisma.portion.findUnique({
      where: { id },
      include: { ingredient: true },
    });
  }

  async update(id: number, data: Partial<{ name: string; weightG: number }>) {
    // 1) Busca a porção atual
    const existing = await prisma.portion.findUniqueOrThrow({
      where: { id },
      include: { ingredient: true },
    });

    // 2) Monta o objeto de atualização
    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.weightG !== undefined) updateData.weightG = data.weightG;

    // 3) Se o peso mudou, recalcula o custo
    if (data.weightG !== undefined) {
      const newCost = calculatePortionCost(
        existing.ingredient.cost as Prisma.Decimal,
        existing.ingredient.weightG,
        data.weightG,
      );
      updateData.cost = newCost;
    }

    // 4) Atualiza
    return prisma.portion.update({
      where: { id },
      data: updateData,
      include: { ingredient: true },
    });
  }

  async delete(id: number) {
    // Verifica se a porção está em uso (ligada a um snack)
    const snackPortions = await prisma.snackPortion.findMany({
      where: { portionId: id },
    });

    if (snackPortions.length > 0) {
      throw new Error("Cannot delete portion that is in use by snacks.");
    }

    await prisma.portion.delete({ where: { id } });
    return { message: "Portion deleted." };
  }
}
