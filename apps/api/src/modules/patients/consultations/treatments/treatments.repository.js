import {
  prisma,
} from "../../../../database/prisma.js";


/*
 * =====================================================
 * BUSCAR CONSULTA
 * =====================================================
 */
export async function findConsultationForTreatment(
  idClinica,
  idPaciente,
  idConsulta
) {
  return prisma.consultas.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      id_consulta:
        idConsulta,
    },

    select: {
      id_consulta: true,
      id_paciente: true,
      estado: true,
    },
  });
}


/*
 * =====================================================
 * CATÁLOGO DE TRATAMIENTOS
 * =====================================================
 */
export async function findActiveTreatments(
  idClinica
) {
  return prisma.tratamientos.findMany({
    where: {
      id_clinica:
        idClinica,

      activo:
        true,
    },

    orderBy: {
      nombre:
        "asc",
    },

    select: {
      id_tratamiento: true,
      codigo: true,
      nombre: true,
      descripcion: true,
      precio_base: true,
      activo: true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR TRATAMIENTO
 * =====================================================
 */
export async function findTreatmentById(
  idClinica,
  idTratamiento
) {
  return prisma.tratamientos.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_tratamiento:
        idTratamiento,

      activo:
        true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR DIENTE
 * =====================================================
 */
export async function findToothById(
  idDiente
) {
  return prisma.dientes.findFirst({
    where: {
      id_diente:
        idDiente,

      activo:
        true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR DETALLE DEL PLAN
 * =====================================================
 */
export async function findPlanDetailById(
  idClinica,
  idPlanDetalle
) {
  return prisma.plan_tratamiento_detalle.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_plan_detalle:
        idPlanDetalle,
    },

    include: {
      tratamientos: {
        select: {
          id_tratamiento: true,
          nombre: true,
        },
      },

      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * LISTAR TRATAMIENTOS REALIZADOS
 * =====================================================
 */
export async function findTreatmentRecordsByConsultation(
  idClinica,
  idConsulta
) {
  return prisma.registros_tratamiento.findMany({
    where: {
      id_clinica:
        idClinica,

      id_consulta:
        idConsulta,
    },

    orderBy: {
      fecha:
        "desc",
    },

    include: {
      tratamientos: {
        select: {
          id_tratamiento: true,
          codigo: true,
          nombre: true,
          precio_base: true,
        },
      },

      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
        },
      },

      usuarios: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
        },
      },

      plan_tratamiento_detalle: {
        select: {
          id_plan_detalle: true,
          estado: true,
          precio_cotizado: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * BUSCAR REGISTRO
 * =====================================================
 */
export async function findTreatmentRecordById(
  idClinica,
  idConsulta,
  idRegistro
) {
  return prisma.registros_tratamiento.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_consulta:
        idConsulta,

      id_registro_tratamiento:
        idRegistro,
    },

    include: {
      tratamientos: true,
      dientes: true,
      usuarios: true,
    },
  });
}


/*
 * =====================================================
 * CREAR REGISTRO
 * =====================================================
 */
export async function createTreatmentRecord({
  idClinica,
  idConsulta,
  idPlanDetalle,
  idTratamiento,
  idDiente,
  idRealizadoPor,
  descripcion,
  valor,
  observaciones,
}) {
  return prisma.registros_tratamiento.create({
    data: {
      id_clinica:
        idClinica,

      id_consulta:
        idConsulta,

      id_plan_detalle:
        idPlanDetalle || null,

      id_tratamiento:
        idTratamiento,

      id_diente:
        idDiente || null,

      id_realizado_por:
        idRealizadoPor,

      descripcion:
        descripcion || null,

      valor,

      observaciones:
        observaciones || null,
    },

    include: {
      tratamientos: {
        select: {
          id_tratamiento: true,
          codigo: true,
          nombre: true,
          precio_base: true,
        },
      },

      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
        },
      },

      usuarios: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * ACTUALIZAR REGISTRO
 * =====================================================
 */
export async function updateTreatmentRecord(
  idRegistro,
  data
) {
  return prisma.registros_tratamiento.update({
    where: {
      id_registro_tratamiento:
        idRegistro,
    },

    data,

    include: {
      tratamientos: {
        select: {
          id_tratamiento: true,
          codigo: true,
          nombre: true,
          precio_base: true,
        },
      },

      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
        },
      },

      usuarios: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
        },
      },
    },
  });
}