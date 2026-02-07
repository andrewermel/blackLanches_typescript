import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma.js";

export class IngredientService {
  async create(name: string, weightG: number, cost: number) {
    return prisma.ingredient.create({
      data: {
        name: name.trim(),
        weightG,
        cost: new Decimal(cost),
      },
    });
  }

  async findAll() {
    return prisma.ingredient.findMany();
  }

  async findById(id: number) {
    return prisma.ingredient.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: { name?: string; weightG?: number; cost?: number },
  ) {
    const updateData: {
      name?: string;
      weightG?: number;
      cost?: Decimal;
    } = {};

    if (data.name) updateData.name = data.name.trim();
    if (data.weightG !== undefined) updateData.weightG = data.weightG;
    if (data.cost !== undefined) updateData.cost = new Decimal(data.cost);

    return prisma.ingredient.update({ where: { id }, data: updateData });
  }

  async delete(id: number) {
    return prisma.ingredient.delete({ where: { id } });
  }
}
