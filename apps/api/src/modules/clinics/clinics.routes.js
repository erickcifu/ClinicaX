import { Router } from "express";

import {
  listClinicsController,
  getClinicController,
  createClinicController,
  updateClinicController,
  updateClinicStatusController,
} from "./clinics.controller.js";

import {
  getClinicSettingsController,
  updateClinicSettingsController,
} from "./settings/clinic-settings.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(
  authenticateToken,
  authorizeRoles("SUPERADMIN")
);

router.get("/", listClinicsController);

router.post("/", createClinicController);

router.patch(
  "/:id/status",
  updateClinicStatusController
);

router.get(
  "/:id/settings",
  getClinicSettingsController
);

router.patch(
  "/:id/settings",
  updateClinicSettingsController
);

router.get(
  "/:id",
  getClinicController
);

router.patch(
  "/:id",
  updateClinicController
);

export default router;
