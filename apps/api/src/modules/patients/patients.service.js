import {
  createPatient,
  findLastPatientByClinic,
  findPatientByDpi,
  findPatientById,
  findPatientsByClinic,
  updatePatient,
} from "./patients.repository.js";

function formatPatient(patient) {
  return {
    ...patient,

    id_paciente:
      patient.id_paciente.toString(),

    id_clinica:
      patient.id_clinica.toString(),
  };
}

export async function getPatientsByClinic(
  idClinica
) {
  const patients =
    await findPatientsByClinic(
      idClinica
    );

  return patients.map(
    formatPatient
  );
}
function generatePatientCode(
  idClinica,
  nextNumber
) {
  const clinicPart =
    idClinica
      .toString()
      .padStart(3, "0");

  const patientPart =
    nextNumber
      .toString()
      .padStart(6, "0");

  return `PAC-${clinicPart}-${patientPart}`;
}
export async function registerPatient(
  idClinica,
  data
) {
  if (data.dpi) {
    const existingPatient =
      await findPatientByDpi(
        idClinica,
        data.dpi
      );

    if (existingPatient) {
      const error = new Error(
        "Ya existe un paciente con este DPI en la clínica"
      );

      error.statusCode = 409;
      error.code =
        "PATIENT_DPI_EXISTS";

      throw error;
    }
  }

  const lastPatient =
    await findLastPatientByClinic(
      idClinica
    );

  const nextNumber =
    lastPatient
      ? Number(
          lastPatient.id_paciente
        ) + 1
      : 1;

  const codigoExpediente =
    generatePatientCode(
      idClinica,
      nextNumber
    );

  const patient =
    await createPatient({
      id_clinica: idClinica,

      codigo_expediente:
        codigoExpediente,

      nombres: data.nombres,
      apellidos: data.apellidos,

      dpi:
        data.dpi || null,

      fecha_nacimiento:
        data.fecha_nacimiento
          ? new Date(
              `${data.fecha_nacimiento}T00:00:00.000Z`
            )
          : null,

      sexo:
        data.sexo || null,

      telefono:
        data.telefono || null,

      correo:
        data.correo || null,

      direccion:
        data.direccion || null,

      ocupacion:
        data.ocupacion || null,

      contacto_emergencia:
        data.contacto_emergencia ||
        null,

      telefono_emergencia:
        data.telefono_emergencia ||
        null,

      observaciones:
        data.observaciones || null,

      activo: true,
    });

  return formatPatient(patient);
}
export async function getPatientById(
  idClinica,
  idPaciente
) {
  const patient =
    await findPatientById(
      idClinica,
      idPaciente
    );

  if (!patient) {
    const error = new Error(
      "El paciente solicitado no existe"
    );

    error.statusCode = 404;
    error.code =
      "PATIENT_NOT_FOUND";

    throw error;
  }

  return formatPatient(patient);
}
export async function modifyPatient(
  idClinica,
  idPaciente,
  data
) {
  const currentPatient =
    await findPatientById(
      idClinica,
      idPaciente
    );

  if (!currentPatient) {
    const error = new Error(
      "El paciente solicitado no existe"
    );

    error.statusCode = 404;
    error.code =
      "PATIENT_NOT_FOUND";

    throw error;
  }

  if (
    data.dpi &&
    data.dpi !== currentPatient.dpi
  ) {
    const patientWithDpi =
      await findPatientByDpi(
        idClinica,
        data.dpi
      );

    if (
      patientWithDpi &&
      patientWithDpi.id_paciente !==
        idPaciente
    ) {
      const error = new Error(
        "Ya existe un paciente con este DPI en la clínica"
      );

      error.statusCode = 409;
      error.code =
        "PATIENT_DPI_EXISTS";

      throw error;
    }
  }

  const updateData = {
    ...data,
  };

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "fecha_nacimiento"
    )
  ) {
    updateData.fecha_nacimiento =
      data.fecha_nacimiento
        ? new Date(
            `${data.fecha_nacimiento}T00:00:00.000Z`
          )
        : null;
  }

  const patient =
    await updatePatient(
      idClinica,
      idPaciente,
      updateData
    );

  if (!patient) {
    const error = new Error(
      "El paciente solicitado no existe"
    );

    error.statusCode = 404;
    error.code =
      "PATIENT_NOT_FOUND";

    throw error;
  }

  return formatPatient(patient);
}