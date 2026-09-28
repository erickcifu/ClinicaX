/*
 * ============================================================
 * MOCK WHATSAPP PROVIDER
 * ============================================================
 *
 * Este proveedor simula el envío de WhatsApp.
 *
 * NO realiza ninguna llamada externa.
 * NO genera costos.
 *
 * Se utilizará durante el desarrollo de ClinicAX.
 *
 * Más adelante podremos agregar:
 *
 *   meta.provider.js
 *
 * sin modificar la lógica del worker de recordatorios.
 */


/*
 * ============================================================
 * ENVIAR MENSAJE
 * ============================================================
 */

export async function sendWhatsAppMessage({
  reminder,
  message,
}) {
  const patient =
    reminder.citas?.pacientes;

  const phone =
    patient?.telefono ||
    "SIN_TELEFONO";


  console.log(
    `[whatsapp][mock] envío de mensaje`,
    {
      idRecordatorio:
        reminder.id_recordatorio.toString(),

      idCita:
        reminder.citas?.id_cita?.toString(),

      telefono:
        phone,

      mensaje:
        message,
    }
  );


  /*
   * Permitir pruebas controladas
   * de errores del proveedor.
   *
   * Esto conserva exactamente
   * el comportamiento que utilizamos
   * durante la prueba anterior.
   */

  if (
    process.env.REMINDER_MOCK_FORCE_ERROR ===
    "true"
  ) {
    throw new Error(
      "Error simulado del proveedor WhatsApp."
    );
  }


  /*
   * Simular respuesta del proveedor.
   */

  return {
    providerMessageId:
      `MOCK-${reminder.id_recordatorio.toString()}-${Date.now()}`,
  };
}