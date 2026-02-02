import { Request, Response } from "express";
import { IngredientService } from "../services/ingredientService.js";

const ingredientService = new IngredientService();

export const createIngredient = async (req: Request, res: Response) => {
  // 1) Validamos entrada mínima
  const { name, weightG, cost } = req.body;
  if (!name || weightG === undefined || cost === undefined) {
    return res
      .status(400)
      .json({ error: "Name, weightG, and cost are required." });
  }
  if (weightG <= 0) {
    return res.status(400).json({ error: "Weight must be positive." });
  }
  if (cost < 0) {
    return res.status(400).json({ error: "Cost must be non-negative." });
  }

  try {
    // 2) Delegamos lógica de criação ao service
    const ingredient = await ingredientService.create(name, weightG, cost);
    return res.status(201).json(ingredient);
  } catch (error: any) {
    // 3) Tratamento de erro comum do Prisma (unique constraint)
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ingredient name already exists." });
    }
    return res.status(500).json({ error: "Error creating ingredient." });
  }
};

export const listIngredients = async (_req: Request, res: Response) => {
  try {
    const ingredients = await ingredientService.findAll();
    return res.json(ingredients);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching ingredients." });
  }
};

export const getIngredient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ingredient = await ingredientService.findById(parseInt(id, 10));
    if (!ingredient)
      return res.status(404).json({ error: "Ingredient not found." });
    return res.json(ingredient);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching ingredient." });
  }
};

export const updateIngredient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, weightG, cost } = req.body;

    if (weightG !== undefined && weightG <= 0) {
      return res.status(400).json({ error: "Weight must be positive." });
    }
    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ error: "Cost must be non-negative." });
    }

    const ingredient = await ingredientService.update(
      parseInt(id, 10),
      name as string | undefined,
      weightG as number | undefined,
      cost as number | undefined,
    );
    return res.json(ingredient);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ingredient name already exists." });
    }
    return res.status(500).json({ error: "Error updating ingredient." });
  }
};

export const deleteIngredient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await ingredientService.delete(parseInt(id, 10));
    return res.json({ message: "Ingredient deleted." });
  } catch (error: any) {
    // Se houver FK constraint no DB, Prisma pode lançar P2025
    return res.status(500).json({ error: "Error deleting ingredient." });
  }
};
