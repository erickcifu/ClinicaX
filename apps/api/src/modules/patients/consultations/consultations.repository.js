import {
  prisma,
} from "../../../database/prisma.js";

/*
 * Verifica que el paciente:
 *
 * 1. exista;
 * 2. pertenezca a la clínica del JWT;
 * 3. no esté eliminado.
 */
export async function findPatientForConsultations(
  idClinica,
  idPaciente
) {
  return prisma.pacientes.findFirst({
    where: {
      id_clinica: idClinica,
      id_paciente: idPaciente,
      fecha_eliminacion: null,
    },

    select: {
      id_paciente: true,
      nombres: true,
      apellidos: true,
      codigo_expediente: true,
    },
  });
}


/*
 * Obtiene todas las consultas de un paciente.
 *
 * Las más recientes aparecen primero.
 */
export async function findConsultationsByPatient(
  idClinica,
  idPaciente
) {
  return prisma.consultas.findMany({
    where: {
      id_clinica: idClinica,
      id_paciente: idPaciente,
    },

    orderBy: {
      fecha_hora_inicio:
        "desc",
    },

    select: {
      id_consulta: true,
      id_clinica: true,
      id_paciente: true,
      id_odontologo: true,
      id_cita: true,

      fecha_hora_inicio: true,
      fecha_hora_fin: true,

      motivo_consulta: true,
      diagnostico: true,
      observaciones: true,

      estado: true,

      fecha_creacion: true,
      fecha_actualizacion: true,

      /*
       * Relación al odontólogo.
       */
      usuarios: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
        },
      },

      /*
       * Si la consulta nació desde una cita,
       * incluimos información básica.
       */
      citas: {
        select: {
          id_cita: true,
          fecha_hora_inicio: true,
          fecha_hora_fin: true,
          motivo: true,
          estado: true,
        },
      },
    },
  });
}


/*
 * Obtiene una consulta específica.
 *
 * Importante:
 * verificamos simultáneamente:
 *
 * clínica + paciente + consulta
 *
 * para mantener aislamiento multi-tenant.
 */
export async function findConsultationById(
  idClinica,
  idPaciente,
  idConsulta
) {
  return prisma.consultas.findFirst({
    where: {
      id_clinica: idClinica,
      id_paciente: idPaciente,
      id_consulta: idConsulta,
    },

    include: {
      usuarios: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
          correo: true,
        },
      },

      citas: {
        select: {
          id_cita: true,
          fecha_hora_inicio: true,
          fecha_hora_fin: true,
          motivo: true,
          estado: true,
          notas: true,
        },
      },

      /*
       * Una consulta puede tener varias
       * tomas de signos vitales.
       */
      signos_vitales: {
        orderBy: {
          fecha_toma: "desc",
        },
      },
    },
  });
}
/* crea una nueva consilta el odontologo que a viene con JWT
le paciente viene desde la url y la clinica desde el JWT.
*/
export async function createConsultation({
  idClinica,
  idPaciente,
  idOdontologo,
  motivoConsulta,
  observaciones,
}) {
  return prisma.consultas.create({
    data: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      id_odontologo:
        idOdontologo,

      motivo_consulta:
        motivoConsulta,

      observaciones:
        observaciones || null,

      /*
       * También existe DEFAULT "ABIERTA"
       * en PostgreSQL, pero lo enviamos
       * explícitamente para que el flujo
       * sea fácil de entender.
       */
      estado:
        "ABIERTA",
    },
  });
}
export async function findOpenConsultationByPatient(
  idClinica,
  idPaciente
) {
  return prisma.consultas.findFirst({
    where: {
      id_clinica: idClinica,
      id_paciente: idPaciente,
      estado: "ABIERTA",
    },

    orderBy: {
      fecha_hora_inicio: "desc",
    },
  });
}
export async function updateConsultation(
  idConsulta,
  data
) {
  return prisma.consultas.update({
    where: {
      id_consulta:
        idConsulta,
    },

    data: {
      ...data,

      fecha_actualizacion:
        new Date(),
    },
  });
}