import { Router } from "express";

import {
  listClinicsController,
  getClinicController,
  createClinicController,
  updateClinicController,
  updateClinicStatusController,
} from "./clinics.controller.js";

const router = Router();

router.get("/", listClinicsController);

router.post("/", createClinicController);

router.patch("/:id/status", updateClinicStatusController);

router.get("/:id", getClinicController);

router.patch("/:id", updateClinicController);

export default router;