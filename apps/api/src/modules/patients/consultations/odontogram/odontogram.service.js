import {
  createOdontogram,
  createOdontogramDetail,
  findActiveTeeth,
  findConsultationForOdontogram,
  findOdontogramByConsultation,
  findOdontogramDetailById,
  findToothById,
  updateOdontogramDetail,
} from "./odontogram.repository.js";


/*
 * =====================================================
 * ERRORES
 * =====================================================
 */

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
      "No se puede modificar el odontograma de una consulta finalizada"
    );

  error.statusCode = 409;
  error.code =
    "CONSULTATION_ALREADY_CLOSED";

  return error;
}


function createOdontogramAlreadyExistsError() {
  const error =
    new Error(
      "La consulta ya tiene un odontograma registrado"
    );

  error.statusCode = 409;
  error.code =
    "ODONTOGRAM_ALREADY_EXISTS";

  return error;
}


function createOdontogramNotFoundError() {
  const error =
    new Error(
      "La consulta todavía no tiene odontograma"
    );

  error.statusCode = 404;
  error.code =
    "ODONTOGRAM_NOT_FOUND";

  return error;
}


function createToothNotFoundError() {
  const error =
    new Error(
      "El diente seleccionado no existe"
    );

  error.statusCode = 404;
  error.code =
    "TOOTH_NOT_FOUND";

  return error;
}


function createOdontogramDetailNotFoundError() {
  const error =
    new Error(
      "El detalle del odontograma no existe"
    );

  error.statusCode = 404;
  error.code =
    "ODONTOGRAM_DETAIL_NOT_FOUND";

  return error;
}


/*
 * =====================================================
 * FORMATEAR DETALLE
 * =====================================================
 */
function formatOdontogramDetail(
  detail
) {
  return {
    ...detail,

    id_odontograma_detalle:
      detail
        .id_odontograma_detalle
        .toString(),

    id_clinica:
      detail
        .id_clinica
        .toString(),

    id_odontograma:
      detail
        .id_odontograma
        .toString(),

    diente:
      detail.dientes
        ? {
            id_diente:
              detail
                .dientes
                .id_diente,

            numero_fdi:
              detail
                .dientes
                .numero_fdi,

            nombre:
              detail
                .dientes
                .nombre,

            denticion:
              detail
                .dientes
                .denticion,
          }
        : null,

    dientes:
      undefined,
  };
}


/*
 * =====================================================
 * FORMATEAR ODONTOGRAMA
 * =====================================================
 */
function formatOdontogram(
  odontogram
) {
  if (!odontogram) {
    return null;
  }

  return {
    ...odontogram,

    id_odontograma:
      odontogram
        .id_odontograma
        .toString(),

    id_clinica:
      odontogram
        .id_clinica
        .toString(),

    id_paciente:
      odontogram
        .id_paciente
        .toString(),

    id_consulta:
      odontogram.id_consulta
        ? odontogram
            .id_consulta
            .toString()
        : null,

    id_odontologo:
      odontogram
        .id_odontologo
        .toString(),

    odontologo:
      odontogram.usuarios
        ? {
            id_usuario:
              odontogram
                .usuarios
                .id_usuario
                .toString(),

            nombres:
              odontogram
                .usuarios
                .nombres,

            apellidos:
              odontogram
                .usuarios
                .apellidos,
          }
        : null,

    detalles:
      odontogram
        .odontograma_detalle
        ?.map(
          formatOdontogramDetail
        ) || [],

    usuarios:
      undefined,

    odontograma_detalle:
      undefined,
  };
}


/*
 * =====================================================
 * GET ODONTOGRAMA
 * =====================================================
 */
export async function getConsultationOdontogram(
  idClinica,
  idPaciente,
  idConsulta
) {
  const consultation =
    await findConsultationForOdontogram(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }

  const odontogram =
    await findOdontogramByConsultation(
      idClinica,
      idConsulta
    );

  return {
    odontogram:
      formatOdontogram(
        odontogram
      ),
  };
}


/*
 * =====================================================
 * CREAR ODONTOGRAMA
 * =====================================================
 */
export async function registerConsultationOdontogram(
  idClinica,
  idPaciente,
  idConsulta,
  idUsuario,
  data
) {
  const consultation =
    await findConsultationForOdontogram(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }

  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    throw createConsultationClosedError();
  }

  const existing =
    await findOdontogramByConsultation(
      idClinica,
      idConsulta
    );

  if (existing) {
    throw createOdontogramAlreadyExistsError();
  }

  await createOdontogram({
    idClinica,
    idPaciente,
    idConsulta,

    idOdontologo:
      idUsuario,

    tipo:
      data.tipo,

    observaciones:
      data.observaciones,
  });

  const created =
    await findOdontogramByConsultation(
      idClinica,
      idConsulta
    );

  return formatOdontogram(
    created
  );
}


/*
 * =====================================================
 * AGREGAR DETALLE
 * =====================================================
 */
export async function addOdontogramDetail(
  idClinica,
  idPaciente,
  idConsulta,
  data
) {
  const consultation =
    await findConsultationForOdontogram(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }

  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    throw createConsultationClosedError();
  }

  const odontogram =
    await findOdontogramByConsultation(
      idClinica,
      idConsulta
    );

  if (!odontogram) {
    throw createOdontogramNotFoundError();
  }

  const tooth =
    await findToothById(
      data.id_diente
    );

  if (!tooth) {
    throw createToothNotFoundError();
  }

  const detail =
    await createOdontogramDetail({
      idClinica,

      idOdontograma:
        odontogram
          .id_odontograma,

      idDiente:
        data.id_diente,

      superficie:
        data.superficie,

      estado:
        data.estado,

      observaciones:
        data.observaciones,
    });

  return formatOdontogramDetail(
    detail
  );
}


/*
 * =====================================================
 * CATÁLOGO DE DIENTES
 * =====================================================
 */
export async function getActiveTeethCatalog() {
  const teeth =
    await findActiveTeeth();

  return {
    teeth,
  };
}


/*
 * =====================================================
 * ACTUALIZAR DETALLE
 * =====================================================
 */
export async function modifyOdontogramDetail(
  idClinica,
  idPaciente,
  idConsulta,
  idDetalle,
  data
) {
  /*
   * 1. Verificamos que la consulta pertenezca
   *    a esta clínica y paciente.
   */
  const consultation =
    await findConsultationForOdontogram(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw createConsultationNotFoundError();
  }


  /*
   * 2. Una consulta finalizada no puede
   *    modificar el odontograma.
   */
  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    throw createConsultationClosedError();
  }


  /*
   * 3. Buscamos el odontograma
   *    correspondiente a la consulta.
   */
  const odontogram =
    await findOdontogramByConsultation(
      idClinica,
      idConsulta
    );

  if (!odontogram) {
    throw createOdontogramNotFoundError();
  }


  /*
   * 4. Verificamos que el detalle realmente
   *    pertenezca a ese odontograma.
   */
  const existingDetail =
    await findOdontogramDetailById(
      idClinica,
      odontogram.id_odontograma,
      idDetalle
    );

  if (!existingDetail) {
    throw createOdontogramDetailNotFoundError();
  }


  /*
   * 5. Actualizamos solamente los campos
   *    enviados.
   */
  const updated =
    await updateOdontogramDetail(
      idDetalle,
      data
    );


  return formatOdontogramDetail(
    updated
  );
}