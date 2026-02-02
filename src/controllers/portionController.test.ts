import { Request, Response } from "express";

jest.mock("../services/portionService.js", () => {
  return {
    PortionService: jest.fn().mockImplementation(() => {
      const inst = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any;
      (global as any).__mockPortionService = inst;
      return inst;
    }),
  };
});

import { PortionService } from "../services/portionService.js";
import {
    createPortion,
    deletePortion,
    getPortion,
    listPortions,
} from "./portionController.js";

const mockPortionService =
  (global as any).__mockPortionService ||
  (PortionService as unknown as jest.Mock).mock.instances[0];

describe("portionController", () => {
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

  it("createPortion validates input", async () => {
    req.body = { name: "P" };
    await createPortion(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it("createPortion success returns 201", async () => {
    const created = { id: 1, name: "P", weightG: 100 };
    req.body = { ingredientId: 1, name: "P", weightG: 100 };
    (mockPortionService.create as jest.Mock).mockResolvedValue(created);

    await createPortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(created);
  });

  it("getPortion returns 404 when not found", async () => {
    req.params = { id: "99" };
    (mockPortionService.findById as jest.Mock).mockResolvedValue(null);

    await getPortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });

  it("listPortions returns array", async () => {
    const list = [{ id: 1, name: "P" }];
    (mockPortionService.findAll as jest.Mock).mockResolvedValue(list);

    await listPortions({} as Request, res as Response);

    expect(json).toHaveBeenCalledWith(list);
  });

  it("deletePortion handles in-use error", async () => {
    req.params = { id: "2" };
    (mockPortionService.delete as jest.Mock).mockRejectedValue(
      new Error("Portion in use"),
    );

    await deletePortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(409);
  });
});
