import { Request, Response } from "express";

jest.mock("../services/snackService.js", () => {
  return {
    SnackService: jest.fn().mockImplementation(() => {
      const inst = {
        createSnack: jest.fn(),
        getAllSnacks: jest.fn(),
        getSnackWithTotals: jest.fn(),
        addPortion: jest.fn(),
        removePortion: jest.fn(),
        deleteSnack: jest.fn(),
      } as any;
      (global as any).__mockSnackService = inst;
      return inst;
    }),
  };
});

import { SnackService } from "../services/snackService.js";
import {
    addPortion,
    createSnack,
    getSnack,
    removePortion,
} from "./snackController.js";

const mockSnackService =
  (global as any).__mockSnackService ||
  (SnackService as unknown as jest.Mock).mock.instances[0];

describe("snackController", () => {
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

  it("createSnack validates name", async () => {
    req.body = {};
    await createSnack(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it("createSnack success", async () => {
    const created = { id: 1, name: "Snack" };
    req.body = { name: "Snack" };
    (mockSnackService.createSnack as jest.Mock).mockResolvedValue(created);

    await createSnack(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(created);
  });

  it("addPortion validates portionId", async () => {
    req.params = { snackId: "1" };
    req.body = {};
    await addPortion(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it("getSnack returns 404 when not found", async () => {
    req.params = { id: "99" };
    (mockSnackService.getSnackWithTotals as jest.Mock).mockResolvedValue(null);

    await getSnack(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });

  it("removePortion returns 404 when not found", async () => {
    req.params = { snackId: "1", portionId: "2" };
    (mockSnackService.removePortion as jest.Mock).mockRejectedValue(
      new Error("not found"),
    );

    await removePortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });
});
