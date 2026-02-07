import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma.js";

import { SnackWithTotals } from "../types/entities.js";

import type { Portion } from "../types/entities.js";

interface TotalsResult {
  totalCost: string;
  totalWeightG: number;
  suggestedPrice: string;
}

const calculateTotals = (portions: Portion[]): TotalsResult => {
  const totalCostDecimal = portions.reduce(
    (sum: Decimal, p: Portion) => sum.plus(new Decimal(String(p.cost))),
    new Decimal(0),
  );
  return {
    totalCost: totalCostDecimal.toFixed(4),
    totalWeightG: portions.reduce((s: number, p: Portion) => s + p.weightG, 0),
    suggestedPrice: totalCostDecimal.mul(new Decimal(2)).toFixed(4),
  };
};

export class SnackService {
  async createSnack(name: string) {
    return prisma.snack.create({
      data: { name: name.trim() },
      include: { snackPortions: { include: { portion: true } } },
    }) as any;
  }

  async getSnackWithTotals(snackId: number): Promise<SnackWithTotals | null> {
    const snack = await prisma.snack.findUnique({
      where: { id: snackId },
      include: { snackPortions: { include: { portion: true } } },
    });

    if (!snack) return null;

    const portions = snack.snackPortions.map((sp) => sp.portion);
    const { totalCost, totalWeightG, suggestedPrice } = calculateTotals(
      portions as Portion[],
    );

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

  async getAllSnacks(): Promise<SnackWithTotals[]> {
    const snacks = await prisma.snack.findMany({
      include: { snackPortions: { include: { portion: true } } },
    });

    return snacks.map((snack) => {
      const portions = snack.snackPortions.map((sp) => sp.portion) as Portion[];
      const { totalCost, totalWeightG, suggestedPrice } =
        calculateTotals(portions);

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
      await tx.snack.findUniqueOrThrow({ where: { id: snackId } });
      await tx.portion.findUniqueOrThrow({ where: { id: portionId } });

      return tx.snackPortion.create({
        data: { snackId, portionId },
      }) as any;
    });
  }

  async removePortion(
    snackId: number,
    portionId: number,
  ): Promise<{ message: string }> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const snackPortion = await tx.snackPortion.findFirst({
        where: { snackId, portionId },
      });

      if (!snackPortion) {
        throw new Error("Portion not found in snack.");
      }

      await tx.snackPortion.delete({ where: { id: snackPortion.id } });

      return { message: "Portion removed." };
    });
  }

  async deleteSnack(snackId: number) {
    return prisma.snack.delete({ where: { id: snackId } }) as any;
  }
}
