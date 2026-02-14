import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

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
  const createdSnackIds: number[] = [];

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    req = { body: {} };
    res = { status, json } as unknown as Response;
  });

  afterAll(async () => {
    if (createdSnackIds.length > 0) {
      await prisma.snackPortion.deleteMany({
        where: { snackId: { in: createdSnackIds } },
      });
      await prisma.snack.deleteMany({
        where: { id: { in: createdSnackIds } },
      });
    }
    await prisma.$disconnect();
  });

  it('createSnack validates name', async () => {
    req.body = {};
    await createSnack(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('createSnack success', async () => {
    req.body = { name: 'TestSnack_' + Date.now() };

    await createSnack(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalled();
    const result = json.mock.calls[0]?.[0] as any;
    expect(result).toHaveProperty('name');
    if (result?.id) createdSnackIds.push(result.id);
  });

  it('addPortion validates portionId', async () => {
    req.params = { snackId: '1' };
    req.body = {};
    await addPortion(req as Request, res as Response);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('getSnack returns 404 when not found', async () => {
    req.params = { id: '999999' };

    await getSnack(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });

  it('removePortion returns 404 when not found', async () => {
    req.params = { snackId: '999999', portionId: '999999' };

    await removePortion(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(404);
  });
});
