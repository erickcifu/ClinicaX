import { Router } from "express";

import {
  listRolesController,
} from "./roles.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(
  authenticateToken,
  authorizeRoles("ADMIN")
);

router.get(
  "/",
  listRolesController
);

export default router;
