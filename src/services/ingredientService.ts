import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

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

  async update(id: number, name?: string, weightG?: number, cost?: number) {
    const data: any = {};
    if (name) data.name = name.trim();
    if (weightG !== undefined) data.weightG = weightG;
    if (cost !== undefined) data.cost = new Decimal(cost);
    return prisma.ingredient.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.ingredient.delete({ where: { id } });
  }
}
