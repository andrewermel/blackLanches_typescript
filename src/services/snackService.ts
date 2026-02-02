import { Prisma, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export class SnackService {
  async createSnack(name: string) {
    return prisma.snack.create({
      data: { name: name.trim() },
      include: { snackPortions: { include: { portion: true } } },
    });
  }

  async getSnackWithTotals(snackId: number) {
    const snack = await prisma.snack.findUnique({
      where: { id: snackId },
      include: { snackPortions: { include: { portion: true } } },
    });

    if (!snack) return null;

    // Extrai as porções
    const portions = snack.snackPortions.map(
      (sp: (typeof snack.snackPortions)[0]) => sp.portion,
    );

    // Calcula totais
    const totalCostDecimal = portions.reduce(
      (sum: Decimal, p: (typeof portions)[0]) =>
        sum.plus(new Decimal(String(p.cost))),
      new Decimal(0),
    );
    const totalCost = totalCostDecimal.toFixed(4);
    const totalWeightG = portions.reduce(
      (s: number, p: (typeof portions)[0]) => s + p.weightG,
      0,
    );

    // Preço sugerido = 2x o custo total
    const suggestedPrice = totalCostDecimal.mul(new Decimal(2)).toFixed(4);

    return {
      id: snack.id,
      name: snack.name,
      portions,
      totalCost,
      totalWeightG,
      suggestedPrice,
      createdAt: snack.createdAt,
      updatedAt: snack.updatedAt,
    };
  }

  async getAllSnacks() {
    const snacks = await prisma.snack.findMany({
      include: { snackPortions: { include: { portion: true } } },
    });

    return snacks.map((snack: (typeof snacks)[0]) => {
      const portions = snack.snackPortions.map(
        (sp: (typeof snack.snackPortions)[0]) => sp.portion,
      );

      const totalCostDecimal = portions.reduce(
        (sum: Decimal, p: (typeof portions)[0]) =>
          sum.plus(new Decimal(String(p.cost))),
        new Decimal(0),
      );
      const totalCost = totalCostDecimal.toFixed(4);
      const totalWeightG = portions.reduce(
        (s: number, p: (typeof portions)[0]) => s + p.weightG,
        0,
      );

      const suggestedPrice = totalCostDecimal.mul(new Decimal(2)).toFixed(4);

      return {
        id: snack.id,
        name: snack.name,
        portions,
        totalCost,
        totalWeightG,
        suggestedPrice,
        createdAt: snack.createdAt,
        updatedAt: snack.updatedAt,
      };
    });
  }

  async addPortion(snackId: number, portionId: number) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Valida que snack e porção existem
      await tx.snack.findUniqueOrThrow({ where: { id: snackId } });
      await tx.portion.findUniqueOrThrow({ where: { id: portionId } });

      // Cria a associação
      const snackPortion = await tx.snackPortion.create({
        data: { snackId, portionId },
      });

      return snackPortion;
    });
  }

  async removePortion(snackId: number, portionId: number) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const snackPortion = await tx.snackPortion.findFirst({
        where: { snackId, portionId },
      });

      if (!snackPortion) {
        throw new Error("Portion not found in snack.");
      }

      await tx.snackPortion.delete({ where: { id: snackPortion.id } });

      return { message: "Portion removed from snack." };
    });
  }

  async deleteSnack(snackId: number) {
    // Deletar um snack cascata deleta suas SnackPortion
    return prisma.snack.delete({ where: { id: snackId } });
  }
}
