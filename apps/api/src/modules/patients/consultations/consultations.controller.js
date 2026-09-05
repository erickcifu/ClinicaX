import {
  getPatientConsultationById,
  getPatientConsultations,
  registerPatientConsultation,
  updatePatientConsultation,
} from "./consultations.service.js";

import {
  patientIdSchema,
} from "../patients.schema.js";

import {
  consultationParamsSchema,
  createConsultationSchema,
  updateConsultationSchema,
} from "./consultations.schema.js";


/*
 * =====================================================
 * GET
 * /patients/:id/consultations
 *
 * Obtiene todas las consultas del paciente.
 * =====================================================
 */
export async function listConsultationsController(
  req,
  res,
  next
) {
  try {
    /*
     * El ID del paciente viene de:
     *
     * /patients/2/consultations
     */
    const {
      id,
    } = patientIdSchema.parse(
      req.params
    );

    /*
     * La clínica SIEMPRE viene del JWT.
     */
    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const result =
      await getPatientConsultations(
        idClinica,
        id
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
 * GET
 * /patients/:id/consultations/:consultationId
 *
 * Obtiene una consulta específica.
 * =====================================================
 */
export async function getConsultationController(
  req,
  res,
  next
) {
  try {
    /*
     * Obtenemos:
     *
     * id             → paciente
     * consultationId → consulta
     */
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

    const consultation =
      await getPatientConsultationById(
        idClinica,
        id,
        consultationId
      );

    return res
      .status(200)
      .json({
        success: true,
        data: consultation,
      });
  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * POST
 * /patients/:id/consultations
 *
 * Crea una nueva consulta.
 *
 * IMPORTANTE:
 *
 * - paciente viene de la URL
 * - clínica viene del JWT
 * - odontólogo viene del JWT
 *
 * No confiamos esos datos al frontend.
 * =====================================================
 */
export async function createConsultationController(
  req,
  res,
  next
) {
  try {
    /*
     * Paciente:
     *
     * /patients/2/consultations
     */
    const {
      id,
    } = patientIdSchema.parse(
      req.params
    );


    /*
     * Validamos únicamente los datos
     * clínicos enviados por frontend.
     */
    const data =
      createConsultationSchema.parse(
        req.body
      );


    /*
     * Clínica autenticada.
     */
    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    /*
     * Usuario autenticado.
     *
     * Como esta ruta solamente permite
     * ODONTOLOGO, este usuario será
     * el odontólogo responsable.
     */
    const idOdontologo =
      BigInt(
        req.auth.userId
      );


    const consultation =
      await registerPatientConsultation(
        idClinica,
        id,
        idOdontologo,
        data
      );


    /*
     * Location HTTP de la consulta creada.
     */
    res.location(
      `/api/v1/patients/${id.toString()}/consultations/${consultation.id_consulta}`
    );


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Consulta creada correctamente",

        data:
          consultation,
      });
  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * PATCH
 * /patients/:id/consultations/:consultationId
 *
 * Actualiza una consulta.
 *
 * Lo utilizaremos para:
 *
 * - diagnóstico
 * - observaciones
 * - finalizar consulta
 * =====================================================
 */
export async function updateConsultationController(
  req,
  res,
  next
) {
  try {
    /*
     * Obtenemos paciente y consulta
     * desde la URL.
     */
    const {
      id,
      consultationId,
    } =
      consultationParamsSchema.parse(
        req.params
      );


    /*
     * Validamos únicamente los campos
     * permitidos para actualizar.
     */
    const data =
      updateConsultationSchema.parse(
        req.body
      );


    /*
     * Clínica segura desde JWT.
     */
    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    /*
     * Ejecutamos la lógica del service.
     */
    const consultation =
      await updatePatientConsultation(
        idClinica,
        id,
        consultationId,
        data
      );


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Consulta actualizada correctamente",

        data:
          consultation,
      });
  } catch (error) {
    next(error);
  }
}