import { getDatabaseInfo } from "./health.repository.js";

export function getApiHealth() {
  return {
    service: "ClinicAX API",
    status: "UP",
    timestamp: new Date().toISOString(),
  };
}

export async function getDatabaseHealth() {
  const databaseInfo = await getDatabaseInfo();

  return {
    service: "ClinicAX API",
    status: "UP",

    database: {
      status: "CONNECTED",
      engine: "PostgreSQL",
      name: databaseInfo.database,
      schema: databaseInfo.schema,
      user: databaseInfo.user,
      version: databaseInfo.version,
      timezone: databaseInfo.timezone,
    },

    timestamp: new Date().toISOString(),
  };
}