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

export const getRandomNickname = () => {
  const NICKNAME_LIST = [
    '맛탐험가',
    '숙박마스터',
    '제품사냥꾼',
    '미식여행자',
    '체험가이드',
    '푸드테스터',
    '숙소탐험가',
    '제품리뷰어',
    '맛있는모험',
    '경험의여왕',
  ];
  const randomIndex = Math.floor(Math.random() * NICKNAME_LIST.length);
  const randomNumber = Math.floor(Math.random() * 100000);

  return `${NICKNAME_LIST[randomIndex]}${randomNumber}`;
};
