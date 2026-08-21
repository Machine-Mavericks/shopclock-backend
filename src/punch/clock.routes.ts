import { Router } from "express";
import { createStudent, getStudentById, getStudentBySecret, punch } from "./clock.controller";

const router = Router();

router.post("/punch", punch);

router.post("/createstudent", createStudent);


// this should be moved to require bearer tokens
router.get("/getstudent/id/:id", getStudentById);
router.get("/getstudent/secret/:secret", getStudentBySecret);

export default router;