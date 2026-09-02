import { Router } from "express";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";

import {
  getMyClinicSettingsController,
  updateMyClinicSettingsController,
} from "./settings/my-clinic-settings.controller.js";

const router = Router();

router.use(
  authenticateToken,
  authorizeRoles("ADMIN")
);

router.get(
  "/settings",
  getMyClinicSettingsController
);

router.patch(
  "/settings",
  updateMyClinicSettingsController
);

export default router;
