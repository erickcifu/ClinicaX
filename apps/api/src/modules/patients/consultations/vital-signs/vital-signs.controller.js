import {
  registerVitalSigns,
} from "./vital-signs.service.js";

import {
  createVitalSignsSchema,
} from "./vital-signs.schema.js";

import {
  consultationParamsSchema,
} from "../consultations.schema.js";


/*
 * POST
 *
 * /patients/:id/consultations/:consultationId/vital-signs
 */
export async function createVitalSignsController(
  req,
  res,
  next
) {
  try {
    const {
      id,
      consultationId,
    } =
      consultationParamsSchema.parse(
        req.params
      );


    /*
     * Validamos los signos vitales.
     */
    const data =
      createVitalSignsSchema.parse(
        req.body
      );


    /*
     * Clínica desde JWT.
     */
    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    /*
     * Usuario que registra desde JWT.
     */
    const idUsuario =
      BigInt(
        req.auth.userId
      );


    const vital =
      await registerVitalSigns(
        idClinica,
        id,
        consultationId,
        idUsuario,
        data
      );


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Signos vitales registrados correctamente",

        data:
          vital,
      });

  } catch (error) {
    next(error);
  }
}