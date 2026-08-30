import { prisma } from "../../database/prisma.js";

export async function findActiveRoles() {
  return prisma.roles.findMany({
    where: {
      activo: true,
    },

    orderBy: {
      id_rol: "asc",
    },
  });
}