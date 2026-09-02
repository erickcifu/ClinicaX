import {
  http,
} from "../../../services/http.js";

export async function getPatients() {
  const response =
    await http.get(
      "/api/v1/patients"
    );

  return response.data.data;
}

export async function getPatient(id) {
  const response =
    await http.get(
      `/api/v1/patients/${id}`
    );

  return response.data.data;
}

export async function createPatient(data) {
  const response =
    await http.post(
      "/api/v1/patients",
      data
    );

  return response.data.data;
}

export async function updatePatient(
  id,
  data
) {
  const response =
    await http.patch(
      `/api/v1/patients/${id}`,
      data
    );

  return response.data.data;
}