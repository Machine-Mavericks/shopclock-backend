import { Router } from "express";
import { punch } from "./punch.controller";

const router = Router();

router.post("/", punch);

export default router;