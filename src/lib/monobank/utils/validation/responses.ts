import { z } from "zod";
import { ClientInfoSchema, InvoiceSchema } from "./types";

export const fetchClientInfoSchema = z.union([ClientInfoSchema, z.object({ errorDescription: z.string() })]);
export const fetchInvoicesSchema = z.union([z.array(InvoiceSchema), z.object({ errorDescription: z.string() })]);
