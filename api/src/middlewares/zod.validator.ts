import { NextFunction, Request, Response } from "express";
import zod, {
  ZodDiscriminatedUnion,
  ZodDiscriminatedUnionOption,
  ZodEffects,
  ZodError,
  ZodObject,
  ZodRawShape,
} from "zod";
import { BadRequestException, InternalServerErrorException } from "../errors";

const exampleSchema = zod.object({
  name: zod.string(),
});

interface IValidateZodMwOptions {
  params?: boolean;
  query?: boolean;
  body?: boolean;
}

const defaultOptions: IValidateZodMwOptions = {
  body: true,
  params: false,
  query: false,
};

export function validate<T extends ZodRawShape, P extends string>(
  schema:
    | ZodObject<T>
    | ZodEffects<ZodObject<T>>
    | ZodDiscriminatedUnion<P, ZodDiscriminatedUnionOption<P>[]>,
  options?: IValidateZodMwOptions
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = { ...defaultOptions, ...options };
    let dataToValidate: Record<string, any> = {};

    if (validationOptions.query) {
      dataToValidate = { ...req.query, ...dataToValidate };
    }

    if (validationOptions.params) {
      dataToValidate = { ...req.params, ...dataToValidate };
    }

    if (validationOptions.body) {
      dataToValidate = { ...req.body, ...dataToValidate };
    }

    try {
      schema.parse(dataToValidate);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.format();
        const errMap = {} as Record<string, Array<string>>;

        for (const k in formattedErrors) {
          if (k == "_errors") {
            continue;
          }

          if (
            Object.keys(formattedErrors[k as keyof typeof formattedErrors])
              .length > 1
          ) {
            Object.keys(
              formattedErrors[k as keyof typeof formattedErrors]
            ).forEach((key) => {
              if (key == "_errors") {
                return;
              }

              errMap[key as keyof typeof formattedErrors] =
                formattedErrors[k as keyof typeof formattedErrors][
                  // @ts-ignore
                  key as keyof typeof formattedErrors
                ]?._errors;
            });
          }

          errMap[k as keyof typeof formattedErrors] =
            // @ts-ignore
            formattedErrors[k as keyof typeof formattedErrors]?._errors;
        }

        return next(new BadRequestException("Bad request.", errMap));
      }

      return next(new InternalServerErrorException());
    }
  };
}
