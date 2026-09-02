import {
  http,
} from "../../../services/http.js";

export async function getDentalHistory(
  patientId
) {
  const response =
    await http.get(
      `/api/v1/patients/${patientId}/dental-history`
    );

  return response.data.data;
}

export async function updateDentalHistory(
  patientId,
  data
) {
  const response =
    await http.patch(
      `/api/v1/patients/${patientId}/dental-history`,
      data
    );

  return response.data.data;
}