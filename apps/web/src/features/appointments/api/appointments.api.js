import { http } from "../../../services/http.js";


export async function getAppointments({
  from,
  to,
  dentistId,
  patientId,
  status,
} = {}) {
  const params = {};

  if (from) {
    params.from = from;
  }

  if (to) {
    params.to = to;
  }

  if (dentistId) {
    params.dentistId = dentistId;
  }

  if (patientId) {
    params.patientId = patientId;
  }

  if (status) {
    params.status = status;
  }


  const response =
    await http.get(
      "/api/v1/appointments",
      {
        params,
      }
    );


  return (
    response.data.data
      ?.appointments ||
    []
  );
}


export async function getAppointmentDentists() {
  const response =
    await http.get(
      "/api/v1/appointments/dentists"
    );


  return (
    response.data.data
      ?.dentists ||
    []
  );
}


export async function getAppointmentPatients() {
  const response =
    await http.get(
      "/api/v1/patients"
    );


  const data =
    response.data.data;


  if (
    Array.isArray(
      data
    )
  ) {
    return data;
  }


  return (
    data?.patients ||
    data?.items ||
    []
  );
}


export async function getAppointment(
  appointmentId
) {
  const response =
    await http.get(
      `/api/v1/appointments/${appointmentId}`
    );


  return response.data.data;
}


export async function createAppointment(
  data
) {
  const response =
    await http.post(
      "/api/v1/appointments",
      data
    );


  return response.data.data;
}


export async function updateAppointment(
  appointmentId,
  data
) {
  const response =
    await http.patch(
      `/api/v1/appointments/${appointmentId}`,
      data
    );


  return response.data.data;
}