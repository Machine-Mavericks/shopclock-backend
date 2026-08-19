import type {Request, Response } from "express";
import { handlePunch } from "./punch.service";

export async function punch(req: Request, res: Response) {
  const { code } = req.body;

  if (typeof code !== "string" || code.length === 0) {
    return res.status(400).json({
      error: "code is requred"
    });
  }

  const result = handlePunch(code);

  if (!result) {
    return res.status(404).json({
      error: "Invalid code"
    });
  }

  return res.json(result);
}