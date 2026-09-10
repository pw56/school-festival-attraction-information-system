import { ApiError } from './ApiError';

export type Validator<T> = (data: unknown) => { success: true; data: T } | { success: false; error: unknown };

export const validateData = <T>(data: unknown, validator?: Validator<T>): T => {
  if (!validator) {
    return data as T;
  }

  const result = validator(data);
  if (!result.success) {
    throw new ApiError(
      'Validation failed',
      422,
      'Unprocessable Entity',
      result.error,
      new Headers()
    );
  }

  return result.data;
};
