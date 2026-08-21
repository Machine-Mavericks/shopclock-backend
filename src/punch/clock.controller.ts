import type {Request, Response } from "express";
import * as db from "../database";
import * as errors from "../errors";

export async function punch(req: Request, res: Response) {
  const { secret } = req.body;

  if (typeof secret !== "string" || secret.length === 0) {
    return res.status(400).json(errors.MALFORMED_PUNCH_REQUEST);
  }

  const student = await db.getStudent(secret);

  if (!student) {
    return res.status(404).json(errors.STUDENT_NOT_FOUND);
  }

  const result = await db.handlePunch(student);

  if (!result) {
    return res.status(500).json({
      error: "big error"
    });
  }

  return res.json(result);
}

export async function createStudent(req: Request, res: Response) {
  const { fullName, secret } = req.body;

  if (!fullName || !secret) {
    return res.status(400).json(errors.MALFORMED_CREATE_STUDENT_REQUEST);

  }

  const student = await db.createStudent(fullName, secret);

  if (!student) {
    return res.status(502).json(errors.CREATE_STUDENT_FAILED);
  }

  return res.status(201).json(student);
}

export async function getStudentBySecret(req: Request, res: Response) {
  const secret = String(req.params.secret);

  if (!secret) {
    return res.status(400).json(errors.MALFORMED_GET_STUDENT_REQUEST);
  }

  const student = await db.getStudent(secret);

  if (!student) {
    return res.status(404).json(errors.STUDENT_NOT_FOUND);
  }

  return res.json(student);
}

export async function getStudentById(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json(errors.MALFORMED_GET_STUDENT_REQUEST);
  }

  const student = await db.getStudent(id);

  if (!student) {
    return res.status(404).json(errors.STUDENT_NOT_FOUND);
  }

  return res.json(student);
}