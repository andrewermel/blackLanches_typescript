import { jest } from '@jest/globals';
import { Request, Response } from 'express';

const mockSnackService = {
  createSnack: jest.fn() as jest.MockedFunction<any>,
  getAllSnacks: jest.fn() as jest.MockedFunction<any>,
  getSnackWithTotals: jest.fn() as jest.MockedFunction<any>,
  addPortion: jest.fn() as jest.MockedFunction<any>,
  removePortion: jest.fn() as jest.MockedFunction<any>,
  deleteSnack: jest.fn() as jest.MockedFunction<any>,
};

jest.mock('../services/snackService.js', () => ({
  SnackService: jest
    .fn()
    .mockImplementation(() => mockSnackService),
}));

import {
  addPortion,
  createSnack,
  getSnack,
  removePortion,
} from './snackController.js';

describe('snackController', () => {
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

  it('createSnack validates name', async () => {
    req.body = {};
    await createSnack(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('createSnack success', async () => {
    req.body = { name: 'TestSnack' + Date.now() };
    mockSnackService.createSnack.mockResolvedValue({
      id: 999,
      ...req.body,
    });

    await createSnack(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalled();
    const result = json.mock.calls[0]?.[0];
    expect(result).toHaveProperty('name');
  });

  it('addPortion validates portionId', async () => {
    req.params = { snackId: '1' };
    req.body = {};
    await addPortion(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('getSnack returns 404 when not found', async () => {
    req.params = { id: '99' };
    mockSnackService.getSnackWithTotals.mockResolvedValue(
      null
    );

    await getSnack(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });

  it('removePortion returns 404 when not found', async () => {
    req.params = { snackId: '999999', portionId: '999999' };
    mockSnackService.removePortion.mockRejectedValue(
      new Error('not found')
    );

    await removePortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });
});
