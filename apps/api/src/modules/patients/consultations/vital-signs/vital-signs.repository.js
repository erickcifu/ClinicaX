import {
  prisma,
} from "../../../../database/prisma.js";


/*
 * Busca una consulta dentro de:
 *
 * clínica + paciente + consulta
 *
 * Esto mantiene aislamiento multi-tenant.
 */
export async function findConsultationForVitalSigns(
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
 * Crea una nueva toma.
 *
 * NO actualiza una anterior.
 *
 * Cada llamada crea un registro nuevo.
 */
export async function createVitalSigns({
  idClinica,
  idPaciente,
  idConsulta,
  idRegistradoPor,
  data,
}) {
  return prisma.signos_vitales.create({
    data: {
      id_clinica:
        idClinica,

      id_paciente:
        idPaciente,

      id_consulta:
        idConsulta,

      id_registrado_por:
        idRegistradoPor,

      presion_sistolica:
        data.presion_sistolica ??
        null,

      presion_diastolica:
        data.presion_diastolica ??
        null,

      frecuencia_cardiaca:
        data.frecuencia_cardiaca ??
        null,

      frecuencia_respiratoria:
        data.frecuencia_respiratoria ??
        null,

      temperatura_c:
        data.temperatura_c ??
        null,

      pulso:
        data.pulso ??
        null,

      cp:
        data.cp ||
        null,

      observaciones:
        data.observaciones ||
        null,
    },
  });
}