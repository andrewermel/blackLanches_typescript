import { jest } from '@jest/globals';
import { Request, Response } from 'express';

const mockPortionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../services/portionService.js', () => ({
  PortionService: jest
    .fn()
    .mockImplementation(() => mockPortionService),
}));

import {
  createPortion,
  deletePortion,
  getPortion,
  listPortions,
} from './portionController.js';

describe('portionController', () => {
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

  it('createPortion validates input', async () => {
    req.body = { name: 'P' };
    await createPortion(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('createPortion success returns 201', async () => {
    req.body = {
      ingredientId: 1,
      name: 'TestPortion' + Date.now(),
      weightG: 100,
    };
    mockPortionService.create.mockResolvedValue({
      id: 999,
      ...req.body,
    });

    await createPortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalled();
    const result = json.mock.calls[0][0];
    expect(result).toHaveProperty('weightG', 100);
  });

  it('getPortion returns 404 when not found', async () => {
    req.params = { id: '99' };
    mockPortionService.findById.mockResolvedValue(null);

    await getPortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });

  it('listPortions returns array', async () => {
    mockPortionService.findAll.mockResolvedValue([
      { id: 1, name: 'P' },
    ]);

    await listPortions({} as Request, res as Response);

    expect(status).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalled();
    expect(Array.isArray(json.mock.calls[0][0])).toBe(true);
  });

  it('deletePortion handles in-use error', async () => {
    req.params = { id: '999999' };
    mockPortionService.delete.mockRejectedValue(
      new Error('Portion in use')
    );

    await deletePortion(req as Request, res as Response);

    // Accept either 404 (not found) or 409 (in use)
    expect([404, 409]).toContain(status.mock.calls[0][0]);
  });
});
