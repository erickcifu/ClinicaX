import { prisma } from "../../database/prisma.js";

export async function getDatabaseInfo() {
  const result = await prisma.$queryRaw`
    SELECT
      current_database() AS database,
      current_schema() AS schema,
      current_user AS user,
      current_setting('server_version') AS version,
      current_setting('TimeZone') AS timezone
  `;

  return result[0];
}