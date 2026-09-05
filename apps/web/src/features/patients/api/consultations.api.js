import {
  http,
} from "../../../services/http.js";


/*
 * =====================================================
 * OBTENER TODAS LAS CONSULTAS DE UN PACIENTE
 * =====================================================
 *
 * GET
 * /api/v1/patients/:id/consultations
 *
 * Ejemplo:
 *
 * /api/v1/patients/2/consultations
 *
 * Retorna:
 *
 * Consulta #2
 * Consulta #1
 * ...
 *
 * ordenadas desde la más reciente.
 */
export async function getConsultations(
  patientId
) {
  const response =
    await http.get(
      `/api/v1/patients/${patientId}/consultations`
    );

  return response.data.data;
}


/*
 * =====================================================
 * OBTENER UNA CONSULTA ESPECÍFICA
 * =====================================================
 *
 * GET
 * /api/v1/patients/:id/consultations/:consultationId
 *
 * Ejemplo:
 *
 * /api/v1/patients/2/consultations/2
 *
 * Aquí obtenemos información más completa,
 * incluyendo signos vitales relacionados.
 */
export async function getConsultation(
  patientId,
  consultationId
) {
  const response =
    await http.get(
      `/api/v1/patients/${patientId}/consultations/${consultationId}`
    );

  return response.data.data;
}


/*
 * =====================================================
 * CREAR UNA CONSULTA
 * =====================================================
 *
 * POST
 * /api/v1/patients/:id/consultations
 *
 * IMPORTANTE:
 *
 * El frontend NO envía:
 *
 * id_clinica
 * id_paciente
 * id_odontologo
 *
 * Porque:
 *
 * paciente   → viene de la URL
 * clínica    → viene del JWT
 * odontólogo → viene del JWT
 *
 * Esto evita que el frontend pueda hacerse pasar
 * libremente por otro odontólogo.
 */
export async function createConsultation(
  patientId,
  data
) {
  const response =
    await http.post(
      `/api/v1/patients/${patientId}/consultations`,
      data
    );

  return response.data.data;
}


/*
 * =====================================================
 * ACTUALIZAR UNA CONSULTA
 * =====================================================
 *
 * PATCH
 * /api/v1/patients/:id/consultations/:consultationId
 *
 * Lo utilizaremos para:
 *
 * - diagnóstico
 * - observaciones
 * - finalizar consulta
 */
export async function updateConsultation(
  patientId,
  consultationId,
  data
) {
  const response =
    await http.patch(
      `/api/v1/patients/${patientId}/consultations/${consultationId}`,
      data
    );

  return response.data.data;
}
export async function createVitalSigns(
  patientId,
  consultationId,
  data
) {
  const response =
    await http.post(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/vital-signs`,
      data
    );

  return response.data.data;
}