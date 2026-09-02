import {
  findDentalHistory,
  findPatientForDentalHistory,
  upsertDentalHistory,
} from "./dental-history.repository.js";

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

function formatDentalHistory(history) {
  if (!history) {
    return null;
  }

  return {
    ...history,

    id_historial_odontologico:
      history
        .id_historial_odontologico
        .toString(),

    id_paciente:
      history
        .id_paciente
        .toString(),
  };
}

export async function getPatientDentalHistory(
  idClinica,
  idPaciente
) {
  const patient =
    await findPatientForDentalHistory(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  const history =
    await findDentalHistory(
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

    dental_history:
      formatDentalHistory(history),
  };
}

export async function savePatientDentalHistory(
  idClinica,
  idPaciente,
  data
) {
  const patient =
    await findPatientForDentalHistory(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  const normalizedData = {
    ...data,
  };

  /*
   * Si el paciente indica que NO tuvo
   * reacción a anestesia, eliminamos
   * cualquier detalle anterior.
   */
  if (
    data.reaccion_anestesia ===
    false
  ) {
    normalizedData.detalle_reaccion_anestesia =
      null;
  }

  const history =
    await upsertDentalHistory(
      idPaciente,
      normalizedData
    );

  return formatDentalHistory(
    history
  );
}