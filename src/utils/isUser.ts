import { Request } from "express";

function isUser(req: Request): req is Request & { user: { id: number } } {
  return req.user !== undefined;
}

export default isUser;
