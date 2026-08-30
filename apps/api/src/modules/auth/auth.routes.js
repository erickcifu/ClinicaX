import { Router } from "express";

import {
  loginController,
  meController,
} from "./auth.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/login",
  loginController
);

router.get(
  "/me",
  authenticateToken,
  meController
);

export default router;