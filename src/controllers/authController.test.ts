import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { login } from "./authController.js";

jest.mock("@prisma/client");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const mockPrisma = PrismaClient as jest.MockedClass<typeof PrismaClient>;

describe("authController - login", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn().mockReturnValue(undefined);
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockReq = {
      body: {},
    };

    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  it("should return 400 if email is missing", async () => {
    mockReq.body = { password: "Test@1234" };

    await login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Email is required.",
    });
  });

  it("should return 400 if password is missing", async () => {
    mockReq.body = { email: "test@example.com" };

    await login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Password is required.",
    });
  });

  it("should return 400 if email format is invalid", async () => {
    mockReq.body = { email: "invalid-email", password: "Test@1234" };

    await login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Invalid email format.",
    });
  });

  it("should return 404 when user not found", async () => {
    mockReq.body = {
      email: "nonexistent@example.com",
      password: "Test@1234",
    };

    const mockFindUnique = jest.fn().mockResolvedValue(null);
    (mockPrisma.prototype.user as any) = { findUnique: mockFindUnique };

    await login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: "User not found." });
  });

  it("should return 401 when password is invalid", async () => {
    mockReq.body = {
      email: "test@example.com",
      password: "WrongPassword@123",
    };

    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: "$2a$12$hashedpassword",
      createdAt: new Date(),
    };

    const mockFindUnique = jest.fn().mockResolvedValue(mockUser);
    (mockPrisma.prototype.user as any) = { findUnique: mockFindUnique };
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: "Invalid password." });
  });

  it("should return token on successful login", async () => {
    mockReq.body = {
      email: "test@example.com",
      password: "Test@1234",
    };

    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: "$2a$12$hashedpassword",
      createdAt: new Date(),
    };

    const mockToken = "jwt.token.here";

    const mockFindUnique = jest.fn().mockResolvedValue(mockUser);
    (mockPrisma.prototype.user as any) = { findUnique: mockFindUnique };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    process.env.JWT_SECRET = "test-secret";

    await login(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith({ token: mockToken });
  });
});
