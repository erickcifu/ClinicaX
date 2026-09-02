import { prisma } from "../../database/prisma.js";

import {
  PLATFORM_ROLE_CODES,
} from "./roles.constants.js";

export async function findActiveRoles() {
  return prisma.roles.findMany({
    where: {
      activo: true,

      codigo: {
        notIn:
          PLATFORM_ROLE_CODES,
      },
    },

    orderBy: {
      id_rol: "asc",
    },
  });
}
