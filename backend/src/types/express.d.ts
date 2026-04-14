import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};
