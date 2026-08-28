import { ZodError } from "zod";

export function errorMiddleware(error, req, res, next) {
  req.log?.error(
    {
      err: error,
      method: req.method,
      url: req.originalUrl,
    },
    "Error procesando petición"
  );

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Los datos enviados no son válidos",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,

    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",

      message:
        statusCode === 500
          ? "Ocurrió un error interno en el servidor"
          : error.message,

      ...(process.env.NODE_ENV === "development" &&
        statusCode === 500 && {
          detail: error.message,
        }),
    },
  });
}