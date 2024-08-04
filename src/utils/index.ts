import { CoreOutput } from 'src/common/dtos/output.dto';

export const logErrorAndReturnFalse = (
  error: any,
  errorMessage: string,
): CoreOutput => {
  try {
    if (error === '') {
      console.error(errorMessage);
    } else {
      console.error(error);
    }

    return { ok: false, error: errorMessage };
  } catch (error) {
    console.error(error);
  }
};
