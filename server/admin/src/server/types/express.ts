import type { Request } from 'express';

export type AdminRequest = Request & {
  adminAuthPayload?: {
    username: string;
    platform: string;
    iat?: number;
    exp?: number;
  };
};

