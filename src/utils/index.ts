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

export const getKoreanTime = (date: Date = new Date()): Date => {
  const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9시간

  return new Date(date.getTime() + kstOffset);
};
