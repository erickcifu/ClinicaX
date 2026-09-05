import {
  addOdontogramDetail,
  getActiveTeethCatalog,
  getConsultationOdontogram,
  modifyOdontogramDetail,
  registerConsultationOdontogram,
} from "./odontogram.service.js";

import {
  consultationParamsSchema,
} from "../consultations.schema.js";

import {
  createOdontogramDetailSchema,
  createOdontogramSchema,
  odontogramDetailParamsSchema,
  updateOdontogramDetailSchema,
} from "./odontogram.schema.js";


/*
 * =====================================================
 * GET ODONTOGRAMA
 * =====================================================
 */
export async function getOdontogramController(
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

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const result =
      await getConsultationOdontogram(
        idClinica,
        id,
        consultationId
      );

    return res
      .status(200)
      .json({
        success: true,
        data: result,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * POST CREAR ODONTOGRAMA
 * =====================================================
 */
export async function createOdontogramController(
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

    const data =
      createOdontogramSchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const idUsuario =
      BigInt(
        req.auth.userId
      );

    const odontogram =
      await registerConsultationOdontogram(
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
          "Odontograma creado correctamente",

        data:
          odontogram,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * POST AGREGAR DETALLE
 * =====================================================
 */
export async function createOdontogramDetailController(
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

    const data =
      createOdontogramDetailSchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const detail =
      await addOdontogramDetail(
        idClinica,
        id,
        consultationId,
        data
      );

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Detalle del odontograma registrado correctamente",

        data:
          detail,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * GET CATÁLOGO DE DIENTES
 * =====================================================
 */
export async function getTeethCatalogController(
  req,
  res,
  next
) {
  try {
    const result =
      await getActiveTeethCatalog();

    return res
      .status(200)
      .json({
        success: true,
        data: result,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * PATCH DETALLE DEL ODONTOGRAMA
 * =====================================================
 */
export async function updateOdontogramDetailController(
  req,
  res,
  next
) {
  try {
    /*
     * Paciente y consulta.
     */
    const {
      id,
      consultationId,
    } =
      consultationParamsSchema.parse(
        req.params
      );


    /*
     * ID específico del detalle.
     */
    const {
      detailId,
    } =
      odontogramDetailParamsSchema.parse(
        req.params
      );


    /*
     * Campos a modificar.
     */
    const data =
      updateOdontogramDetailSchema.parse(
        req.body
      );


    /*
     * Clínica SIEMPRE desde JWT.
     */
    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const detail =
      await modifyOdontogramDetail(
        idClinica,
        id,
        consultationId,
        detailId,
        data
      );


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Detalle del odontograma actualizado correctamente",

        data:
          detail,
      });

  } catch (error) {
    next(error);
  }
}