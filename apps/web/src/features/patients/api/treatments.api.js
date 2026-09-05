import {
  http,
} from "../../../services/http.js";


/*
 * =====================================================
 * CATÁLOGO DE TRATAMIENTOS
 * =====================================================
 */
export async function getTreatmentsCatalog() {
  const response =
    await http.get(
      "/api/v1/patients/treatments/catalog"
    );

  return response.data.data.treatments;
}


/*
 * =====================================================
 * TRATAMIENTOS REALIZADOS EN UNA CONSULTA
 * =====================================================
 */
export async function getConsultationTreatments(
  patientId,
  consultationId
) {
  const response =
    await http.get(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/treatments`
    );

  return response.data.data;
}


/*
 * =====================================================
 * REGISTRAR TRATAMIENTO
 * =====================================================
 */
export async function createConsultationTreatment(
  patientId,
  consultationId,
  data
) {
  const response =
    await http.post(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/treatments`,
      data
    );

  return response.data.data;
}


/*
 * =====================================================
 * ACTUALIZAR TRATAMIENTO
 * =====================================================
 */
export async function updateConsultationTreatment(
  patientId,
  consultationId,
  treatmentRecordId,
  data
) {
  const response =
    await http.patch(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/treatments/${treatmentRecordId}`,
      data
    );

  return response.data.data;
}