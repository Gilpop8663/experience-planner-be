import { getKoreanTime } from 'src/utils';
import { ParsedGangnamContent } from './types';
import { PLATFORM_NAME } from './constants';

/**
 *
 * @param dateString // "08.22 ~ 08.23" 형식
 * @returns Date
 */
export const getDeadlineDate = (dateString: string) => {
  const dateArr = dateString.split('~');
  const [prevMonth, prevDay] = dateArr[0].trim().split('.').map(Number);
  const [nextMonth, nextDay] = dateArr[1].trim().split('.').map(Number);

  // 날짜 형식 변환
  const currentYear = new Date().getFullYear(); // 현재 연도

  // Date 객체 생성
  const startDate = new Date(currentYear, prevMonth - 1, prevDay, 23, 59, 59); // 월은 0부터 시작하므로 -1
  const endDate = new Date(currentYear, nextMonth - 1, nextDay, 23, 59, 59); // 월은 0부터 시작하므로 -1

  // 만약 endDate가 오늘 날짜보다 이전이라면, 다음 연도로 설정
  if (endDate < startDate) {
    endDate.setFullYear(currentYear + 1);
  }

  const koreanEndDate = getKoreanTime(endDate);

  return koreanEndDate;
};

/**
 * 날짜가 들어오면 해당 날의 23시 59분 59초로 되도록 하는 함수
 * @param inputDate
 * @returns
 */
export const getEndOfDay = (inputDate: Date) => {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return new Date(year, month, day, 23, 59, 59);
};

/**
* 강남맛집 콘텐츠를 파싱하는 함수
*  파싱 로직을 구현하여 콘텐츠에서 필요한 데이터를 추출합니다.
   예를 들어, 정규 표현식이나 특정 형식에 맞게 파싱할 수 있습니다.
   이 함수는 콘텐츠를 분석하여 필요한 정보를 반환해야 합니다.
* @param content 
* @returns 
*/
export const parseGangnamContent = (content: string): ParsedGangnamContent => {
  const info: ParsedGangnamContent = {
    title: '',
    location: '',
    reviewDeadline: new Date(0),
    serviceDetails: '',
  };

  // 1. 제목 패턴 탐지: [지역] 상호명 형태는 유지
  const titleMatch = content.match(/\[(.+)\] (.+)/);
  if (titleMatch) {
    info.title = titleMatch[0];
  }

  // 2. 제공내역: 1회 체험권이나 특정 금액 체험권을 동적으로 인식
  // 2. 제공내역: 타이틀 바로 다음 줄을 제공내역으로 가져오기
  const contentAfterTitle = content
    .substring(titleMatch.index! + titleMatch[0].length)
    .trim();

  // 다음 줄의 첫 번째 줄을 제공내역으로 추출
  const serviceDetailsMatch = contentAfterTitle
    .split('\n')
    .slice(0, 2)
    .join(' ')
    .trim();
  info.serviceDetails = serviceDetailsMatch || '제공내역을 찾을 수 없음';

  // 3. 리뷰 기간: 리뷰 등록기간 다음에 나오는 날짜 패턴
  const reviewPeriodMatch = content.match(
    /리뷰 등록기간\s*([0-9]{2}\.[0-9]{2} ~ [0-9]{2}\.[0-9]{2})/,
  );
  if (reviewPeriodMatch) {
    info.reviewDeadline = getDeadlineDate(reviewPeriodMatch[1]);
  }

  // 4. 지역: '© NAVER Corp.' 이후 1줄을 지역 정보로 추출
  const naverIndex = content.indexOf('© NAVER Corp.');
  if (naverIndex !== -1) {
    const contentAfterNaver = content.substring(naverIndex).split('\n');

    // '© NAVER Corp.' 다음 줄 추출
    if (contentAfterNaver.length > 1) {
      info.location = contentAfterNaver[1].trim();
    }
  }

  console.log(info);

  return info;
};

export const getPlatformName = (linkUrl: string) => {
  const parsedLinkUrl = linkUrl.split('https://')[1];

  const SITE_NAME = {
    강남맛집: 'xn--939au0g4vj8sq',
    레뷰: 'www.revu.net',
    리뷰노트: 'reviewnote',
    미블: 'mrblog',
  };

  if (parsedLinkUrl.includes(SITE_NAME.강남맛집)) {
    return PLATFORM_NAME.강남맛집;
  }

  if (parsedLinkUrl.includes(SITE_NAME.레뷰)) {
    return PLATFORM_NAME.레뷰;
  }

  if (parsedLinkUrl.includes(SITE_NAME.리뷰노트)) {
    return PLATFORM_NAME.리뷰노트;
  }

  if (parsedLinkUrl.includes(SITE_NAME.미블)) {
    return PLATFORM_NAME.미블;
  }
};
