import {
  http,
} from "../../../services/http.js";

export async function getMedicalHistory(
  patientId
) {
  const response =
    await http.get(
      `/api/v1/patients/${patientId}/medical-history`
    );

  return response.data.data;
}

export async function updateMedicalHistory(
  patientId,
  data
) {
  const response =
    await http.patch(
      `/api/v1/patients/${patientId}/medical-history`,
      data
    );

  return response.data.data;
}