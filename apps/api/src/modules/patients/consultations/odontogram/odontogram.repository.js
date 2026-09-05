import {
  prisma,
} from "../../../../database/prisma.js";


/*
 * =====================================================
 * BUSCAR CONSULTA
 * =====================================================
 *
 * Siempre verificamos:
 *
 * - clínica
 * - paciente
 * - consulta
 */
export async function findConsultationForOdontogram(
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
      id_odontologo: true,
      estado: true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR ODONTOGRAMA POR CONSULTA
 * =====================================================
 */
export async function findOdontogramByConsultation(
  idClinica,
  idConsulta
) {
  return prisma.odontogramas.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_consulta:
        idConsulta,
    },

    include: {
      usuarios: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
        },
      },

      odontograma_detalle: {
        orderBy: [
          {
            id_diente: "asc",
          },
        ],

        include: {
          dientes: {
            select: {
              id_diente: true,
              numero_fdi: true,
              nombre: true,
              denticion: true,
            },
          },
        },
      },
    },
  });
}


/*
 * =====================================================
 * CREAR ODONTOGRAMA
 * =====================================================
 */
export async function createOdontogram({
  idClinica,
  idPaciente,
  idConsulta,
  idOdontologo,
  tipo,
  observaciones,
}) {
  return prisma.odontogramas.create({
    data: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      id_consulta:
        idConsulta,

      id_odontologo:
        idOdontologo,

      tipo,

      observaciones:
        observaciones || null,
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
 * CREAR DETALLE
 * =====================================================
 */
export async function createOdontogramDetail({
  idClinica,
  idOdontograma,
  idDiente,
  superficie,
  estado,
  observaciones,
}) {
  return prisma.odontograma_detalle.create({
    data: {
      id_clinica:
        idClinica,

      id_odontograma:
        idOdontograma,

      id_diente:
        idDiente,

      superficie,

      estado,

      observaciones:
        observaciones || null,
    },

    include: {
      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
          denticion: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * LISTAR DIENTES ACTIVOS
 * =====================================================
 */
export async function findActiveTeeth() {
  return prisma.dientes.findMany({
    where: {
      activo: true,
    },

    orderBy: {
      numero_fdi:
        "asc",
    },

    select: {
      id_diente: true,
      numero_fdi: true,
      nombre: true,
      denticion: true,
      activo: true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR DETALLE DEL ODONTOGRAMA
 * =====================================================
 *
 * IMPORTANTE:
 *
 * Lo buscamos además por:
 *
 * - clínica
 * - odontograma
 *
 * para mantener el aislamiento multi-clínica.
 */
export async function findOdontogramDetailById(
  idClinica,
  idOdontograma,
  idDetalle
) {
  return prisma.odontograma_detalle.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_odontograma:
        idOdontograma,

      id_odontograma_detalle:
        idDetalle,
    },

    include: {
      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
          denticion: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * ACTUALIZAR DETALLE
 * =====================================================
 */
export async function updateOdontogramDetail(
  idDetalle,
  data
) {
  return prisma.odontograma_detalle.update({
    where: {
      id_odontograma_detalle:
        idDetalle,
    },

    data: {
      ...(data.superficie !== undefined && {
        superficie:
          data.superficie,
      }),

      ...(data.estado !== undefined && {
        estado:
          data.estado,
      }),

      ...(data.observaciones !== undefined && {
        observaciones:
          data.observaciones,
      }),
    },

    include: {
      dientes: {
        select: {
          id_diente: true,
          numero_fdi: true,
          nombre: true,
          denticion: true,
        },
      },
    },
  });
}