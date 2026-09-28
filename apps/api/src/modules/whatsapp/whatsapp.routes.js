import {
  Router,
} from "express";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";

import {
  createWhatsAppConfigurationController,
  getWhatsAppConfigurationController,
  updateWhatsAppConfigurationController,
} from "./whatsapp.controller.js";

const router = Router();

router.use(
  authenticateToken,
  authorizeRoles("ADMIN")
);

router.get(
  "/configuration",
  getWhatsAppConfigurationController
);

router.post(
  "/configuration",
  createWhatsAppConfigurationController
);

router.patch(
  "/configuration",
  updateWhatsAppConfigurationController
);

export default router;
