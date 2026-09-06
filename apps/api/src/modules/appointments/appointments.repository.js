import {
  prisma,
} from "../../database/prisma.js";


/*
 * =====================================================
 * INCLUDE GENERAL
 * =====================================================
 *
 * Lo reutilizamos para que:
 *
 * listado
 * detalle
 * creación
 * actualización
 *
 * regresen una estructura parecida.
 */
const appointmentInclude = {
  pacientes: {
    select: {
      id_paciente: true,
      codigo_expediente: true,
      nombres: true,
      apellidos: true,
      telefono: true,
      correo: true,
    },
  },

  usuarios_citas_id_clinica_id_odontologoTousuarios: {
    select: {
      id_usuario: true,
      nombres: true,
      apellidos: true,
      correo: true,
    },
  },

  usuarios_citas_id_clinica_id_creado_porTousuarios: {
    select: {
      id_usuario: true,
      nombres: true,
      apellidos: true,
    },
  },

  consultas: {
    select: {
      id_consulta: true,
      estado: true,
      fecha_hora_inicio: true,
      fecha_hora_fin: true,
    },
  },
};


/*
 * =====================================================
 * CONFIGURACIÓN DE CLÍNICA
 * =====================================================
 */
export async function findClinicAppointmentConfiguration(
  idClinica
) {
  return prisma.configuracion_clinica.findUnique({
    where: {
      id_clinica:
        idClinica,
    },

    select: {
      duracion_cita_minutos:
        true,

      horas_recordatorio:
        true,

      moneda:
        true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR PACIENTE
 * =====================================================
 */
export async function findPatientForAppointment(
  idClinica,
  idPaciente
) {
  return prisma.pacientes.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      activo:
        true,

      fecha_eliminacion:
        null,
    },

    select: {
      id_paciente: true,
      nombres: true,
      apellidos: true,
    },
  });
}


/*
 * =====================================================
 * BUSCAR ODONTÓLOGO
 * =====================================================
 *
 * Además de pertenecer a la clínica:
 *
 * - debe estar activo
 * - no eliminado
 * - debe tener rol ODONTOLOGO
 */
export async function findDentistForAppointment(
  idClinica,
  idOdontologo
) {
  return prisma.usuarios.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_usuario:
        idOdontologo,

      estado:
        "ACTIVO",

      fecha_eliminacion:
        null,

      usuario_roles: {
        some: {
          roles: {
            codigo:
              "ODONTOLOGO",

            activo:
              true,
          },
        },
      },
    },

    select: {
      id_usuario: true,
      nombres: true,
      apellidos: true,
      correo: true,
    },
  });
}


/*
 * =====================================================
 * LISTAR ODONTÓLOGOS
 * =====================================================
 *
 * Será utilizado por el frontend de Agenda.
 */
export async function findActiveDentists(
  idClinica
) {
  return prisma.usuarios.findMany({
    where: {
      id_clinica:
        idClinica,

      estado:
        "ACTIVO",

      fecha_eliminacion:
        null,

      usuario_roles: {
        some: {
          roles: {
            codigo:
              "ODONTOLOGO",

            activo:
              true,
          },
        },
      },
    },

    orderBy: [
      {
        nombres:
          "asc",
      },
      {
        apellidos:
          "asc",
      },
    ],

    select: {
      id_usuario: true,
      nombres: true,
      apellidos: true,
      correo: true,
      telefono: true,
    },
  });
}


/*
 * =====================================================
 * LISTAR CITAS
 * =====================================================
 *
 * Para rangos de tiempo utilizamos:
 *
 * inicio < to
 * fin    > from
 *
 * Así obtenemos cualquier cita que se cruce
 * con el rango solicitado.
 */
export async function findAppointments({
  idClinica,
  from,
  to,
  dentistId,
  patientId,
  status,
}) {
  const where = {
    id_clinica:
      idClinica,

    ...(dentistId && {
      id_odontologo:
        dentistId,
    }),

    ...(patientId && {
      id_paciente:
        patientId,
    }),

    ...(status && {
      estado:
        status,
    }),
  };


  /*
   * Si tenemos rango completo:
   *
   * cita_inicio < rango_fin
   * cita_fin    > rango_inicio
   */
  if (
    from &&
    to
  ) {
    where.fecha_hora_inicio = {
      lt:
        to,
    };

    where.fecha_hora_fin = {
      gt:
        from,
    };
  } else if (from) {
    where.fecha_hora_fin = {
      gt:
        from,
    };
  } else if (to) {
    where.fecha_hora_inicio = {
      lt:
        to,
    };
  }


  return prisma.citas.findMany({
    where,

    orderBy: [
      {
        fecha_hora_inicio:
          "asc",
      },
      {
        id_odontologo:
          "asc",
      },
    ],

    include:
      appointmentInclude,
  });
}


/*
 * =====================================================
 * BUSCAR CITA
 * =====================================================
 */
export async function findAppointmentById(
  idClinica,
  idCita
) {
  return prisma.citas.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_cita:
        idCita,
    },

    include:
      appointmentInclude,
  });
}


/*
 * =====================================================
 * SOLAPAMIENTO DEL ODONTÓLOGO
 * =====================================================
 *
 * Existe traslape cuando:
 *
 * cita_existente.inicio < nuevo_fin
 *
 * Y
 *
 * cita_existente.fin > nuevo_inicio
 *
 * CANCELADA y NO_ASISTIO
 * no bloquean horarios.
 */
export async function findDentistAppointmentOverlap({
  idClinica,
  idOdontologo,
  fechaInicio,
  fechaFin,
  excludeAppointmentId = null,
}) {
  return prisma.citas.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_odontologo:
        idOdontologo,

      estado: {
        notIn: [
          "CANCELADA",
          "NO_ASISTIO",
        ],
      },

      fecha_hora_inicio: {
        lt:
          fechaFin,
      },

      fecha_hora_fin: {
        gt:
          fechaInicio,
      },

      ...(excludeAppointmentId && {
        id_cita: {
          not:
            excludeAppointmentId,
        },
      }),
    },

    select: {
      id_cita: true,
      fecha_hora_inicio: true,
      fecha_hora_fin: true,

      pacientes: {
        select: {
          nombres: true,
          apellidos: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * SOLAPAMIENTO DEL PACIENTE
 * =====================================================
 */
export async function findPatientAppointmentOverlap({
  idClinica,
  idPaciente,
  fechaInicio,
  fechaFin,
  excludeAppointmentId = null,
}) {
  return prisma.citas.findFirst({
    where: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      estado: {
        notIn: [
          "CANCELADA",
          "NO_ASISTIO",
        ],
      },

      fecha_hora_inicio: {
        lt:
          fechaFin,
      },

      fecha_hora_fin: {
        gt:
          fechaInicio,
      },

      ...(excludeAppointmentId && {
        id_cita: {
          not:
            excludeAppointmentId,
        },
      }),
    },

    select: {
      id_cita: true,
      fecha_hora_inicio: true,
      fecha_hora_fin: true,

      usuarios_citas_id_clinica_id_odontologoTousuarios: {
        select: {
          nombres: true,
          apellidos: true,
        },
      },
    },
  });
}


/*
 * =====================================================
 * CREAR CITA
 * =====================================================
 */
export async function createAppointment({
  idClinica,
  idPaciente,
  idOdontologo,
  idCreadoPor,
  fechaInicio,
  fechaFin,
  motivo,
  estado,
  notas,
}) {
  return prisma.citas.create({
    data: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      id_odontologo:
        idOdontologo,

      id_creado_por:
        idCreadoPor,

      fecha_hora_inicio:
        fechaInicio,

      fecha_hora_fin:
        fechaFin,

      motivo:
        motivo || null,

      estado,

      notas:
        notas || null,
    },

    include:
      appointmentInclude,
  });
}


/*
 * =====================================================
 * ACTUALIZAR CITA
 * =====================================================
 */
export async function updateAppointment(
  idCita,
  data
) {
  return prisma.citas.update({
    where: {
      id_cita:
        idCita,
    },

    data: {
      ...data,

      fecha_actualizacion:
        new Date(),
    },

    include:
      appointmentInclude,
  });
}