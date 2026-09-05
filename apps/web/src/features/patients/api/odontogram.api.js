import {
  http,
} from "../../../services/http.js";


/*
 * =====================================================
 * CATÁLOGO DE DIENTES
 * =====================================================
 *
 * GET
 * /api/v1/patients/odontogram/teeth
 */
export async function getTeethCatalog() {
  const response =
    await http.get(
      "/api/v1/patients/odontogram/teeth"
    );

  return response.data.data.teeth;
}


/*
 * =====================================================
 * OBTENER ODONTOGRAMA
 * =====================================================
 *
 * GET
 * /api/v1/patients/:patientId/consultations/:consultationId/odontogram
 */
export async function getOdontogram(
  patientId,
  consultationId
) {
  const response =
    await http.get(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/odontogram`
    );

  return response.data.data.odontogram;
}


/*
 * =====================================================
 * CREAR ODONTOGRAMA
 * =====================================================
 *
 * POST
 * /api/v1/patients/:patientId/consultations/:consultationId/odontogram
 */
export async function createOdontogram(
  patientId,
  consultationId,
  data
) {
  const response =
    await http.post(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/odontogram`,
      data
    );

  return response.data.data;
}


/*
 * =====================================================
 * AGREGAR DETALLE
 * =====================================================
 *
 * POST
 * /api/v1/patients/:patientId/consultations/:consultationId/odontogram/details
 */
export async function createOdontogramDetail(
  patientId,
  consultationId,
  data
) {
  const response =
    await http.post(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/odontogram/details`,
      data
    );

  return response.data.data;
}


/*
 * =====================================================
 * ACTUALIZAR DETALLE
 * =====================================================
 *
 * PATCH
 * /api/v1/patients/:patientId/consultations/:consultationId/odontogram/details/:detailId
 */
export async function updateOdontogramDetail(
  patientId,
  consultationId,
  detailId,
  data
) {
  const response =
    await http.patch(
      `/api/v1/patients/${patientId}/consultations/${consultationId}/odontogram/details/${detailId}`,
      data
    );

  return response.data.data;
}