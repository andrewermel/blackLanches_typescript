import { jest } from '@jest/globals';
import { Request, Response } from 'express';

const mockIngredientService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../services/ingredientService.js', () => ({
  IngredientService: jest
    .fn()
    .mockImplementation(() => mockIngredientService),
}));

import {
  createIngredient,
  getIngredient,
  listIngredients,
} from './ingredientController.js';

describe('ingredientController', () => {
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

  it('createIngredient returns 400 when weight is zero', async () => {
    req.body = { name: 'X', weightG: 0, cost: 50 };
    await createIngredient(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalled();
  });

  it('createIngredient success returns 201 with created ingredient', async () => {
    req.body = {
      name: 'TestIngredient' + Date.now(),
      weightG: 1000,
      cost: 24,
    };
    mockIngredientService.create.mockResolvedValue({
      id: 999,
      ...req.body,
    });

    await createIngredient(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalled();
    const result = json.mock.calls[0][0];
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('weightG', 1000);
  });

  it('getIngredient returns 404 when not found', async () => {
    req.params = { id: '99' };
    (
      mockIngredientService.findById as jest.Mock
    ).mockResolvedValue(null);

    await getIngredient(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: 'Not found.',
    });
  });

  it('listIngredients returns array', async () => {
    mockIngredientService.findAll.mockResolvedValue([
      { id: 1, name: 'A' },
    ]);

    await listIngredients({} as Request, res as Response);

    expect(status).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalled();
    expect(Array.isArray(json.mock.calls[0][0])).toBe(true);
  });
});
