import { http } from "../../../services/http.js";

export async function getClinics() {
  const response = await http.get("/api/v1/clinics");

  return response.data.data;
}

export async function createClinic(data) {
  const response = await http.post("/api/v1/clinics", data);

  return response.data.data;
}