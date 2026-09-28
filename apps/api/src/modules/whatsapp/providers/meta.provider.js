/*
 * ============================================================
 * META WHATSAPP PROVIDER
 * ============================================================
 *
 * Este archivo será el proveedor de WhatsApp para Meta.
 *
 * IMPORTANTE:
 *
 * Actualmente NO realiza ninguna llamada a Meta.
 *
 * Lo estamos preparando para que posteriormente pueda
 * conectarse con WhatsApp Business Cloud API.
 *
 * La configuración real deberá pertenecer a cada clínica.
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
  /*
   * La configuración de Meta todavía no está implementada.
   *
   * Más adelante recibiremos aquí la configuración de la
   * clínica correspondiente.
   */

  console.log(
    `[whatsapp][meta] proveedor preparado para envío`,
    {
      idRecordatorio:
        reminder.id_recordatorio.toString(),

      idCita:
        reminder.citas?.id_cita?.toString(),

      mensaje:
        message,
    }
  );


  /*
   * Todavía no hacemos ninguna llamada HTTP.
   *
   * Cuando implementemos Meta aquí tendremos algo
   * conceptualmente parecido a:
   *
   *   Meta API
   *      ↑
   *      │
   *   access token
   *      │
   *   phone number id
   *
   * Pero esos datos todavía NO deben colocarse aquí.
   */

  throw new Error(
    "Proveedor Meta WhatsApp todavía no está implementado."
  );
}