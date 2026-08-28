import "dotenv/config";

import app from "./app.js";
import { prisma } from "./database/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`ClinicAX API ejecutándose en http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} recibido. Cerrando ClinicAX API...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();

      console.log("Conexión con PostgreSQL cerrada correctamente.");
      console.log("ClinicAX API finalizada.");

      process.exit(0);
    } catch (error) {
      console.error("Error cerrando la aplicación:", error);

      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));