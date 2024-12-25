import { format } from "sharp";
import zod from "zod";

const compressSchema = zod.object({
  operation: zod.literal("compress"),
  quality: zod.number().optional(),
});

const convertSchema = zod.object({
  operation: zod.literal("convert"),
  format: zod.string(),
});

export const createMediaSchema = zod.discriminatedUnion(
  "operation",
  [
    compressSchema,
    convertSchema,
  ]
);

export type CreateMediaDto = zod.infer<typeof createMediaSchema>;
