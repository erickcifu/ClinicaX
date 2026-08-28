import { prisma } from "./database/prisma.js";

async function main() {
  console.log("Probando conexión con PostgreSQL...");

  const result = await prisma.$queryRaw`
    SELECT
      current_database() AS database,
      current_schema() AS schema,
      current_user AS user,
      current_setting('server_version') AS version
  `;

  console.log("Conexión exitosa ✅");
  console.log(result[0]);
}

main()
  .catch((error) => {
    console.error("Error de conexión ❌");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });