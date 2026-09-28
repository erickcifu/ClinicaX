import { z } from "zod";

const providerValueSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(
    z.enum([
      "META",
      "MOCK",
    ])
  );

const createProviderSchema =
  providerValueSchema.default("META");

const nullableText = (maxLength, message) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .nullable();

export const createWhatsAppConfigurationSchema =
  z.object({
    proveedor: createProviderSchema,

    phone_number_id: nullableText(
      100,
      "El phone_number_id es demasiado largo"
    ).optional(),

    business_account_id: nullableText(
      100,
      "El business_account_id es demasiado largo"
    ).optional(),

    access_token: nullableText(
      4096,
      "El access_token es demasiado largo"
    ).optional(),

    activo: z.boolean().default(false),
  });

export const updateWhatsAppConfigurationSchema =
  z
    .object({
      proveedor: providerValueSchema.optional(),

      phone_number_id: nullableText(
        100,
        "El phone_number_id es demasiado largo"
      ).optional(),

      business_account_id: nullableText(
        100,
        "El business_account_id es demasiado largo"
      ).optional(),

      access_token: nullableText(
        4096,
        "El access_token es demasiado largo"
      ).optional(),

      activo: z.boolean().optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "Debe enviar al menos una configuración para actualizar",
      }
    );
