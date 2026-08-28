import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import clinicsRoutes from "./modules/clinics/clinics.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(pinoHttp());

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
  })
);

// ===============================
// API Routes
// ===============================

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/clinics", clinicsRoutes);
// ===============================
// Ruta no encontrada
// ===============================

app.use(notFoundMiddleware);

// ===============================
// Manejo global de errores
// ===============================

app.use(errorMiddleware);

export default app;