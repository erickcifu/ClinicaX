import {
  createVitalSigns,
  findConsultationForVitalSigns,
} from "./vital-signs.repository.js";


function createConsultationNotFoundError() {
  const error =
    new Error(
      "La consulta solicitada no existe"
    );

  error.statusCode = 404;
  error.code =
    "CONSULTATION_NOT_FOUND";

  return error;
}


function createConsultationClosedError() {
  const error =
    new Error(
      "No se pueden registrar signos vitales en una consulta finalizada"
    );

  error.statusCode = 409;
  error.code =
    "CONSULTATION_ALREADY_CLOSED";

  return error;
}


/*
 * Convierte BigInt y Decimal
 * para poder responder JSON.
 */
function formatVitalSigns(
  vital
) {
  return {
    ...vital,

    id_signo_vital:
      vital.id_signo_vital.toString(),

    id_clinica:
      vital.id_clinica.toString(),

    id_paciente:
      vital.id_paciente.toString(),

    id_consulta:
      vital.id_consulta
        ? vital.id_consulta.toString()
        : null,

    id_registrado_por:
      vital.id_registrado_por
        ? vital.id_registrado_por.toString()
        : null,

    temperatura_c:
      vital.temperatura_c !== null
        ? Number(
            vital.temperatura_c
          )
        : null,
  };
}


export async function registerVitalSigns(
  idClinica,
  idPaciente,
  idConsulta,
  idUsuario,
  data
) {
  /*
   * Primero comprobamos que la consulta
   * pertenece al paciente y clínica.
   */
  const consultation =
    await findConsultationForVitalSigns(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }


  /*
   * No permitimos modificar el expediente
   * de una consulta ya finalizada.
   */
  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    throw createConsultationClosedError();
  }


  /*
   * Cada POST genera una toma nueva.
   */
  const vital =
    await createVitalSigns({
      idClinica,
      idPaciente,
      idConsulta,

      /*
       * Usuario autenticado que registró
       * la medición.
       */
      idRegistradoPor:
        idUsuario,

      data,
    });


  return formatVitalSigns(
    vital
  );
}