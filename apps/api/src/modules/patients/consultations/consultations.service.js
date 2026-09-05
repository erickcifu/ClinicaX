import {
  createConsultation,
  findConsultationById,
  findConsultationsByPatient,
  findOpenConsultationByPatient,
  findPatientForConsultations,
  updateConsultation,
} from "./consultations.repository.js";


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


/*
 * Formatea datos que contienen BigInt.
 *
 * JSON no puede serializar BigInt
 * directamente.
 */
function formatConsultation(
  consultation
) {
  return {
    ...consultation,

    id_consulta:
      consultation.id_consulta.toString(),

    id_clinica:
      consultation.id_clinica.toString(),

    id_paciente:
      consultation.id_paciente.toString(),

    id_odontologo:
      consultation.id_odontologo.toString(),

    id_cita:
      consultation.id_cita
        ? consultation.id_cita.toString()
        : null,

    /*
     * Odontólogo.
     */
    odontologo:
      consultation.usuarios
        ? {
            id_usuario:
              consultation.usuarios.id_usuario.toString(),

            nombres:
              consultation.usuarios.nombres,

            apellidos:
              consultation.usuarios.apellidos,

            correo:
              consultation.usuarios.correo,
          }
        : null,

    /*
     * Cita relacionada.
     */
    cita:
      consultation.citas
        ? {
            ...consultation.citas,

            id_cita:
              consultation.citas.id_cita.toString(),
          }
        : null,

    /*
     * No exponemos los nombres internos
     * de las relaciones Prisma.
     */
    usuarios: undefined,
    citas: undefined,

    /*
     * Si estamos viendo el detalle,
     * pueden venir signos vitales.
     */
    signos_vitales:
      consultation.signos_vitales
        ? consultation.signos_vitales.map(
            (vital) => ({
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

              /*
               * Prisma Decimal también lo
               * convertimos a número.
               */
              temperatura_c:
                vital.temperatura_c !== null
                  ? Number(
                      vital.temperatura_c
                    )
                  : null,
            })
          )
        : undefined,
  };
}


/*
 * LISTADO DE CONSULTAS
 */
export async function getPatientConsultations(
  idClinica,
  idPaciente
) {
  const patient =
    await findPatientForConsultations(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  const consultations =
    await findConsultationsByPatient(
      idClinica,
      idPaciente
    );

  return {
    patient: {
      id_paciente:
        patient.id_paciente.toString(),

      codigo_expediente:
        patient.codigo_expediente,

      nombres:
        patient.nombres,

      apellidos:
        patient.apellidos,
    },

    consultations:
      consultations.map(
        formatConsultation
      ),
  };
}


/*
 * DETALLE DE UNA CONSULTA
 */
export async function getPatientConsultationById(
  idClinica,
  idPaciente,
  idConsulta
) {
  const patient =
    await findPatientForConsultations(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  const consultation =
    await findConsultationById(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }

  return formatConsultation(
    consultation
  );
}
/*
 * Crea una nueva consulta clínica.
 *
 * El odontólogo autenticado se recibe
 * desde req.auth.userId.
 */
export async function registerPatientConsultation(
  idClinica,
  idPaciente,
  idOdontologo,
  data
) {
  const patient =
    await findPatientForConsultations(
      idClinica,
      idPaciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  /*
   * Verificamos si ya existe
   * una consulta abierta.
   */
  const openConsultation =
    await findOpenConsultationByPatient(
      idClinica,
      idPaciente
    );

  if (openConsultation) {
    const error =
      new Error(
        "El paciente ya tiene una consulta abierta. Finalícela antes de crear una nueva."
      );

    error.statusCode = 409;
    error.code =
      "OPEN_CONSULTATION_EXISTS";

    throw error;
  }

  const created =
    await createConsultation({
      idClinica,
      idPaciente,
      idOdontologo,

      motivoConsulta:
        data.motivo_consulta,

      observaciones:
        data.observaciones,
    });

  const consultation =
    await findConsultationById(
      idClinica,
      idPaciente,
      created.id_consulta
    );

  return formatConsultation(
    consultation
  );
}
export async function updatePatientConsultation(
  idClinica,
  idPaciente,
  idConsulta,
  data
) {
  const consultation =
    await findConsultationById(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }

  /*
   * No permitimos modificar una
   * consulta ya finalizada.
   */
  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    const error =
      new Error(
        "La consulta ya fue finalizada"
      );

    error.statusCode = 409;
    error.code =
      "CONSULTATION_ALREADY_CLOSED";

    throw error;
  }

  const updateData = {
    ...data,
  };

  /*
   * Cuando se finaliza guardamos
   * fecha y hora de cierre.
   */
  if (
    data.estado ===
    "FINALIZADA"
  ) {
    updateData.fecha_hora_fin =
      new Date();
  }

  await updateConsultation(
    idConsulta,
    updateData
  );

  const updated =
    await findConsultationById(
      idClinica,
      idPaciente,
      idConsulta
    );

  return formatConsultation(
    updated
  );
}