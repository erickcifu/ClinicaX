import { Router } from "express";

import {
  createUserController,
  getUserController,
  listUsersController,
} from "./users.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(
  authenticateToken
);

router.get(
  "/",
  authorizeRoles("ADMIN"),
  listUsersController
);

router.post(
  "/",
  authorizeRoles("ADMIN"),
  createUserController
);

router.get(
  "/:id",
  authorizeRoles("ADMIN"),
  getUserController
);

export default router;