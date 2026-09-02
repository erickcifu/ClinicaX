import { http } from "../../../services/http.js";

export async function getClinics() {
  const response = await http.get("/api/v1/clinics");

  return response.data.data;
}

export async function createClinic(data) {
  const response = await http.post(
    "/api/v1/clinics",
    data
  );

  return response.data.data;
}

export async function updateClinic(id, data) {
  const response = await http.patch(
    `/api/v1/clinics/${id}`,
    data
  );

  return response.data.data;
}

export async function updateClinicStatus(id, estado) {
  const response = await http.patch(
    `/api/v1/clinics/${id}/status`,
    {
      estado,
    }
  );

  return response.data.data;
}

export async function getClinicSettings(id) {
  const response = await http.get(
    `/api/v1/clinics/${id}/settings`
  );

  return response.data.data;
}

export async function updateClinicSettings(id, data) {
  const response = await http.patch(
    `/api/v1/clinics/${id}/settings`,
    data
  );

  return response.data.data;
}

export async function getMyClinicSettings() {
  const response = await http.get(
    "/api/v1/my-clinic/settings"
  );

  return response.data.data;
}

export async function updateMyClinicSettings(data) {
  const response = await http.patch(
    "/api/v1/my-clinic/settings",
    data
  );

  return response.data.data;
}
