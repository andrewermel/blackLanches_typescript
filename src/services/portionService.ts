import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma.js";

const calculatePortionCost = (
  ingredientCost: Decimal,
  ingredientWeightG: number,
  portionWeightG: number,
) => {
  return ingredientCost
    .div(new Decimal(ingredientWeightG))
    .mul(new Decimal(portionWeightG));
};

export class PortionService {
  async create(ingredientId: number, name: string, weightG: number) {
    const ingredient = await prisma.ingredient.findUniqueOrThrow({
      where: { id: ingredientId },
    });

    const cost = calculatePortionCost(
      ingredient.cost as Decimal,
      ingredient.weightG,
      weightG,
    );

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

  async update(id: number, data: { name?: string; weightG?: number }) {
    const existing = await prisma.portion.findUniqueOrThrow({
      where: { id },
      include: { ingredient: true },
    });

    const updateData: {
      name?: string;
      weightG?: number;
      cost?: Decimal;
    } = {};

    if (data.name) updateData.name = data.name.trim();
    if (data.weightG !== undefined) updateData.weightG = data.weightG;

    if (data.weightG !== undefined) {
      const newCost = calculatePortionCost(
        existing.ingredient.cost as Decimal,
        existing.ingredient.weightG,
        data.weightG,
      );
      updateData.cost = newCost;
    }

    return prisma.portion.update({
      where: { id },
      data: updateData,
      include: { ingredient: true },
    });
  }

  async delete(id: number): Promise<{ message: string }> {
    const snackPortions = await prisma.snackPortion.findMany({
      where: { portionId: id },
    });

    if (snackPortions.length > 0) {
      throw new Error("Portion is in use by snacks.");
    }

    await prisma.portion.delete({ where: { id } });
    return { message: "Deleted." };
  }
}
