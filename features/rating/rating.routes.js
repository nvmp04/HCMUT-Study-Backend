import { Router } from "express";
import { rating } from "./rating.controller.js";
const router = Router();

router.put('/rating', rating);

export default router;