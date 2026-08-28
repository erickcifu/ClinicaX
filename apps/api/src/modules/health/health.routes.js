import { Router } from "express";

import {
  healthController,
  databaseHealthController,
} from "./health.controller.js";

const router = Router();

router.get("/", healthController);

router.get("/database", databaseHealthController);

export default router;