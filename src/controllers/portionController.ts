import { Request, Response } from "express";
import { PortionService } from "../services/portionService.js";

const portionService = new PortionService();

export const createPortion = async (req: Request, res: Response) => {
  // 1) Validação básica
  const { ingredientId, name, weightG } = req.body;
  if (!ingredientId || !name || weightG === undefined) {
    return res.status(400).json({
      error: "ingredientId, name, and weightG are required.",
    });
  }
  if (weightG <= 0) {
    return res.status(400).json({ error: "Weight must be positive." });
  }

  try {
    // 2) Delegamos ao service (calcula custo automaticamente)
    const portion = await portionService.create(
      ingredientId as number,
      name as string,
      weightG as number,
    );
    return res.status(201).json(portion);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(400).json({ error: "Ingredient not found." });
    }
    return res.status(500).json({ error: "Error creating portion." });
  }
};

export const listPortions = async (_req: Request, res: Response) => {
  try {
    const portions = await portionService.findAll();
    return res.json(portions);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching portions." });
  }
};

export const getPortion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const portion = await portionService.findById(parseInt(id, 10));
    if (!portion) return res.status(404).json({ error: "Portion not found." });
    return res.json(portion);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching portion." });
  }
};

export const updatePortion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, weightG } = req.body;

    if (weightG !== undefined && weightG <= 0) {
      return res.status(400).json({ error: "Weight must be positive." });
    }

    // Monta objeto de atualização apenas com campos definidos
    const updateData: Partial<{ name: string; weightG: number }> = {};
    if (name !== undefined) updateData.name = name as string;
    if (weightG !== undefined) updateData.weightG = weightG as number;

    const portion = await portionService.update(parseInt(id, 10), updateData);
    return res.json(portion);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Portion not found." });
    }
    return res.status(500).json({ error: "Error updating portion." });
  }
};

export const deletePortion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await portionService.delete(parseInt(id, 10));
    return res.json(result);
  } catch (error: any) {
    if (error.message.includes("in use")) {
      return res.status(409).json({ error: error.message });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Portion not found." });
    }
    return res.status(500).json({ error: "Error deleting portion." });
  }
};
