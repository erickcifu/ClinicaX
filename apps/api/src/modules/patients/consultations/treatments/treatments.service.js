import {
  createTreatmentRecord,
  findActiveTreatments,
  findConsultationForTreatment,
  findPlanDetailById,
  findToothById,
  findTreatmentById,
  findTreatmentRecordById,
  findTreatmentRecordsByConsultation,
  updateTreatmentRecord,
} from "./treatments.repository.js";


/*
 * =====================================================
 * ERRORES
 * =====================================================
 */

function consultationNotFound() {
  const error =
    new Error(
      "La consulta solicitada no existe"
    );

  error.statusCode = 404;
  error.code =
    "CONSULTATION_NOT_FOUND";

  return error;
}


function consultationClosed() {
  const error =
    new Error(
      "No se pueden modificar tratamientos de una consulta finalizada"
    );

  error.statusCode = 409;
  error.code =
    "CONSULTATION_ALREADY_CLOSED";

  return error;
}


function treatmentNotFound() {
  const error =
    new Error(
      "El tratamiento seleccionado no existe o está inactivo"
    );

  error.statusCode = 404;
  error.code =
    "TREATMENT_NOT_FOUND";

  return error;
}


function toothNotFound() {
  const error =
    new Error(
      "El diente seleccionado no existe"
    );

  error.statusCode = 404;
  error.code =
    "TOOTH_NOT_FOUND";

  return error;
}


function treatmentRecordNotFound() {
  const error =
    new Error(
      "El registro de tratamiento no existe"
    );

  error.statusCode = 404;
  error.code =
    "TREATMENT_RECORD_NOT_FOUND";

  return error;
}


function planDetailNotFound() {
  const error =
    new Error(
      "El detalle del plan de tratamiento no existe"
    );

  error.statusCode = 404;
  error.code =
    "TREATMENT_PLAN_DETAIL_NOT_FOUND";

  return error;
}


/*
 * =====================================================
 * FORMAT
 * =====================================================
 */
function formatDecimal(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return Number(value);
}


function formatRecord(
  record
) {
  return {
    ...record,

    id_registro_tratamiento:
      record
        .id_registro_tratamiento
        .toString(),

    id_clinica:
      record
        .id_clinica
        .toString(),

    id_consulta:
      record
        .id_consulta
        .toString(),

    id_plan_detalle:
      record.id_plan_detalle
        ? record
            .id_plan_detalle
            .toString()
        : null,

    id_tratamiento:
      record
        .id_tratamiento
        .toString(),

    id_realizado_por:
      record
        .id_realizado_por
        .toString(),

    valor:
      formatDecimal(
        record.valor
      ),

    tratamientos:
      record.tratamientos
        ? {
            ...record.tratamientos,

            id_tratamiento:
              record
                .tratamientos
                .id_tratamiento
                .toString(),

            precio_base:
              formatDecimal(
                record
                  .tratamientos
                  .precio_base
              ),
          }
        : null,

    realizado_por:
      record.usuarios
        ? {
            id_usuario:
              record
                .usuarios
                .id_usuario
                .toString(),

            nombres:
              record
                .usuarios
                .nombres,

            apellidos:
              record
                .usuarios
                .apellidos,
          }
        : null,

    diente:
      record.dientes || null,

    usuarios:
      undefined,

    dientes:
      undefined,
  };
}


/*
 * =====================================================
 * CATÁLOGO
 * =====================================================
 */
export async function getTreatmentsCatalog(
  idClinica
) {
  const treatments =
    await findActiveTreatments(
      idClinica
    );

  return treatments.map(
    (treatment) => ({
      ...treatment,

      id_tratamiento:
        treatment
          .id_tratamiento
          .toString(),

      precio_base:
        formatDecimal(
          treatment.precio_base
        ),
    })
  );
}


/*
 * =====================================================
 * LISTAR REGISTROS
 * =====================================================
 */
export async function getConsultationTreatmentRecords(
  idClinica,
  idPaciente,
  idConsulta
) {
  const consultation =
    await findConsultationForTreatment(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw consultationNotFound();
  }

  const records =
    await findTreatmentRecordsByConsultation(
      idClinica,
      idConsulta
    );

  return records.map(
    formatRecord
  );
}


/*
 * =====================================================
 * CREAR REGISTRO
 * =====================================================
 */
export async function registerConsultationTreatment(
  idClinica,
  idPaciente,
  idConsulta,
  idUsuario,
  data
) {
  const consultation =
    await findConsultationForTreatment(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw consultationNotFound();
  }

  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    throw consultationClosed();
  }


  const treatment =
    await findTreatmentById(
      idClinica,
      data.id_tratamiento
    );

  if (!treatment) {
    throw treatmentNotFound();
  }


  if (
    data.id_diente
  ) {
    const tooth =
      await findToothById(
        data.id_diente
      );

    if (!tooth) {
      throw toothNotFound();
    }
  }


  if (
    data.id_plan_detalle
  ) {
    const planDetail =
      await findPlanDetailById(
        idClinica,
        data.id_plan_detalle
      );

    if (!planDetail) {
      throw planDetailNotFound();
    }
  }


  const record =
    await createTreatmentRecord({
      idClinica,
      idConsulta,

      idPlanDetalle:
        data.id_plan_detalle,

      idTratamiento:
        data.id_tratamiento,

      idDiente:
        data.id_diente,

      idRealizadoPor:
        idUsuario,

      descripcion:
        data.descripcion,

      valor:
        data.valor,

      observaciones:
        data.observaciones,
    });


  return formatRecord(
    record
  );
}


/*
 * =====================================================
 * ACTUALIZAR
 * =====================================================
 */
export async function modifyConsultationTreatment(
  idClinica,
  idPaciente,
  idConsulta,
  idRegistro,
  data
) {
  const consultation =
    await findConsultationForTreatment(
      idClinica,
      idPaciente,
      idConsulta
    );

  if (!consultation) {
    throw consultationNotFound();
  }


  if (
    consultation.estado ===
    "FINALIZADA"
  ) {
    throw consultationClosed();
  }


  const existing =
    await findTreatmentRecordById(
      idClinica,
      idConsulta,
      idRegistro
    );

  if (!existing) {
    throw treatmentRecordNotFound();
  }


  if (
    data.id_tratamiento
  ) {
    const treatment =
      await findTreatmentById(
        idClinica,
        data.id_tratamiento
      );

    if (!treatment) {
      throw treatmentNotFound();
    }
  }


  if (
    data.id_diente
  ) {
    const tooth =
      await findToothById(
        data.id_diente
      );

    if (!tooth) {
      throw toothNotFound();
    }
  }


  const updated =
    await updateTreatmentRecord(
      idRegistro,
      {
        ...(data.id_tratamiento !== undefined && {
          id_tratamiento:
            data.id_tratamiento,
        }),

        ...(data.id_diente !== undefined && {
          id_diente:
            data.id_diente,
        }),

        ...(data.descripcion !== undefined && {
          descripcion:
            data.descripcion,
        }),

        ...(data.valor !== undefined && {
          valor:
            data.valor,
        }),

        ...(data.observaciones !== undefined && {
          observaciones:
            data.observaciones,
        }),
      }
    );


  return formatRecord(
    updated
  );
}