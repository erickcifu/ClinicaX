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

const router = Router();

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