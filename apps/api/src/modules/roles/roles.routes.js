import { Router } from "express";

import {
  listRolesController,
} from "./roles.controller.js";

const router = Router();

router.get(
  "/",
  listRolesController
);

export default router;