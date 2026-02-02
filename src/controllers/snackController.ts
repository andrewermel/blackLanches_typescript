import { Request, Response } from "express";
import { SnackService } from "../services/snackService.js";

const snackService = new SnackService();

export const createSnack = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Snack name is required." });
  }

  try {
    const snack = await snackService.createSnack(name);
    return res.status(201).json(snack);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Snack name already exists." });
    }
    return res.status(500).json({ error: "Error creating snack." });
  }
};

export const listSnacks = async (_req: Request, res: Response) => {
  try {
    const snacks = await snackService.getAllSnacks();
    return res.json(snacks);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching snacks." });
  }
};

export const getSnack = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const snack = await snackService.getSnackWithTotals(parseInt(id, 10));
    if (!snack) return res.status(404).json({ error: "Snack not found." });
    return res.json(snack);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching snack." });
  }
};

export const addPortion = async (req: Request, res: Response) => {
  try {
    const snackId = req.params.snackId as string;
    const { portionId } = req.body;

    if (!portionId) {
      return res.status(400).json({ error: "portionId is required." });
    }

    const snackPortion = await snackService.addPortion(
      parseInt(snackId, 10),
      portionId as number,
    );
    return res.status(201).json(snackPortion);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(400).json({ error: "Snack or portion not found." });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Portion already added to this snack." });
    }
    return res.status(500).json({ error: "Error adding portion to snack." });
  }
};

export const removePortion = async (req: Request, res: Response) => {
  try {
    const snackId = req.params.snackId as string;
    const portionId = req.params.portionId as string;

    const result = await snackService.removePortion(
      parseInt(snackId, 10),
      parseInt(portionId, 10),
    );
    return res.json(result);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error removing portion." });
  }
};

export const deleteSnack = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await snackService.deleteSnack(parseInt(id, 10));
    return res.json({ message: "Snack deleted." });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Snack not found." });
    }
    return res.status(500).json({ error: "Error deleting snack." });
  }
};
