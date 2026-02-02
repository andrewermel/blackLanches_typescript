import { Request, Response } from "express";

jest.mock("../services/ingredientService.js", () => {
  return {
    IngredientService: jest.fn().mockImplementation(() => {
      const inst = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any;
      (global as any).__mockIngredientService = inst;
      return inst;
    }),
  };
});

import { IngredientService } from "../services/ingredientService.js";
import {
    createIngredient,
    getIngredient,
    listIngredients,
} from "./ingredientController.js";

const mockIngredientService =
  (global as any).__mockIngredientService ||
  (IngredientService as unknown as jest.Mock).mock.instances[0];

describe("ingredientController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    req = { body: {} };
    res = { status, json } as unknown as Response;
  });

  it("createIngredient returns 400 when missing fields", async () => {
    req.body = { name: "X" };
    await createIngredient(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalled();
  });

  it("createIngredient success returns 201 with created ingredient", async () => {
    const created = { id: 1, name: "A", weightG: 1000, cost: 24 };
    req.body = { name: "A", weightG: 1000, cost: 24 };
    (mockIngredientService.create as jest.Mock).mockResolvedValue(created);

    await createIngredient(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(created);
  });

  it("getIngredient returns 404 when not found", async () => {
    req.params = { id: "99" };
    (mockIngredientService.findById as jest.Mock).mockResolvedValue(null);

    await getIngredient(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: "Ingredient not found." });
  });

  it("listIngredients returns array", async () => {
    const list = [{ id: 1, name: "A" }];
    (mockIngredientService.findAll as jest.Mock).mockResolvedValue(list);

    await listIngredients({} as Request, res as Response);

    expect(json).toHaveBeenCalledWith(list);
  });
});
