import {
  findMedicalHistory,
  findPatientForMedicalHistory,
  upsertMedicalHistory,
} from "./medical-history.repository.js";

function createPatientNotFoundError() {
  const error =
    new Error(
      "El paciente solicitado no existe"
    );

  error.statusCode = 404;
  error.code =
    "PATIENT_NOT_FOUND";

  return error;
}

function formatMedicalHistory(history) {
  if (!history) {
    return null;
  }

  return {
    ...history,

    id_historial_medico:
      history
        .id_historial_medico
        .toString(),

    id_paciente:
      history
        .id_paciente
        .toString(),
  };
}

export async function getPatientMedicalHistory(
  idClinica,
  idPaciente
) {
  const patient =
    await findPatientForMedicalHistory(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  const history =
    await findMedicalHistory(
      idPaciente
    );

  return {
    patient: {
      id_paciente:
        patient.id_paciente.toString(),

      nombres:
        patient.nombres,

      apellidos:
        patient.apellidos,
    },

    medical_history:
      formatMedicalHistory(history),
  };
}

export async function savePatientMedicalHistory(
  idClinica,
  idPaciente,
  data
) {
  const patient =
    await findPatientForMedicalHistory(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  const normalizedData = {
    ...data,
  };

  if (
    data.hospitalizado_ultimos_2_anios ===
    false
  ) {
    normalizedData.detalle_hospitalizacion =
      null;
  }

  if (
    data.tratamiento_medico_ultimos_2_anios ===
    false
  ) {
    normalizedData.detalle_tratamiento_medico =
      null;
  }

  if (
    data.alergia_medicamentos ===
    false
  ) {
    normalizedData.detalle_alergias =
      null;
  }

  if (
    data.hemorragias === false
  ) {
    normalizedData.detalle_hemorragias =
      null;
  }

  if (
    data.medicacion_actual === false
  ) {
    normalizedData.detalle_medicacion_actual =
      null;
  }

  if (
    data.embarazo === false
  ) {
    normalizedData.semanas_embarazo =
      null;
  }

  if (
    data.consume_drogas === false
  ) {
    normalizedData.detalle_drogas =
      null;
  }

  const history =
    await upsertMedicalHistory(
      idPaciente,
      normalizedData
    );

  return formatMedicalHistory(
    history
  );
}