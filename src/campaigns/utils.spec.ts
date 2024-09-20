import { getDeadlineDate, parseGangnamContent } from './utils';
import { GANGNAM_DATA } from './siteContentData';

describe('getDeadlineDate', () => {
  it('should return the correct end date for the given date string', () => {
    // 테스트 케이스 1: 일반적인 경우
    const dateString = '08.22 ~ 08.23';
    const expectedDate = new Date(new Date().getFullYear(), 7, 23, 23, 59, 59);
    // 08.23, 현재 연도
    const result = getDeadlineDate(dateString);
    expect(result).toStrictEqual(expectedDate);

    // 테스트 케이스 2: 현재 날짜가 종료 날짜보다 이후일 때
    const pastDateString = '08.22 ~ 08.21'; // 올해 8월 21일
    const nextYearDate = new Date(
      new Date().getFullYear() + 1,
      7,
      21,
      23,
      59,
      59,
    );

    // 다음 해 08.21
    const pastResult = getDeadlineDate(pastDateString);
    expect(pastResult).toStrictEqual(nextYearDate);

    // 추가적인 테스트 케이스는 필요에 따라 작성
  });
});

describe('getDeadlineDate', () => {
  it('should return the correct end date for the given date string', () => {
    // 테스트 케이스 1: 일반적인 경우
    const dateString = '08.22 ~ 08.23';
    const expectedDate = new Date(new Date().getFullYear(), 7, 23, 23, 59, 59);

    // 08.23, 현재 연도
    const result = getDeadlineDate(dateString);
    expect(result).toStrictEqual(expectedDate);

    // 테스트 케이스 2: 현재 날짜가 종료 날짜보다 이후일 때
    const pastDateString = '08.22 ~ 08.21'; // 올해 8월 21일
    const nextYearDate = new Date(
      new Date().getFullYear() + 1,
      7,
      21,
      23,
      59,
      59,
    ); // 다음 해 08.21
    const pastResult = getDeadlineDate(pastDateString);
    expect(pastResult).toStrictEqual(nextYearDate);

    // 추가적인 테스트 케이스는 필요에 따라 작성
  });
});

test.each([
  [
    '서울',
    GANGNAM_DATA.서울,
    {
      title: '[서울 송파] 37.5 잠실점',
      serviceDetails: '3만원 체험권 (2인 기준)',
      reviewDeadline: getDeadlineDate('09.21 ~ 10.11'),
      location: '서울 송파구 오금동 615',
    },
  ],
  [
    '경기도',
    GANGNAM_DATA.경기도,
    {
      title: '[경기 수원] 월화식당 광교점',
      serviceDetails: '3만원 체험권 (2인기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '경기 수원시 영통구 이의동 1330',
    },
  ],
  [
    '경남',
    GANGNAM_DATA.경남,
    {
      title: '[경남 합천] 현대야영장',
      serviceDetails: '1일 숙박권(4인 기준) 반드시 가이드라인을 확인해주세요.',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '경남 합천군 용주면 죽죽리 121-1 현대야영장',
    },
  ],
  [
    '경북',
    GANGNAM_DATA.경북,
    {
      title: '[경북 구미] 천하대신당',
      serviceDetails: '전화점사 o r방문점사 1회 체험권',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '경북 구미시 구평동 471-7',
    },
  ],
  [
    '광주',
    GANGNAM_DATA.광주,
    {
      title: '[광주 광산] 라라브레드 광주수완점',
      serviceDetails: '음료 택 2잔 + 브런치 메뉴 택 1 체험권 (2인 기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.18'),
      location: '광주 광산구 장덕동 1613 라라브레드 광주수완점',
    },
  ],
  [
    '대구',
    GANGNAM_DATA.대구,
    {
      title: '[대구 북구] 파란',
      serviceDetails: '메인메뉴 택1 + 사이드메뉴 택1 (2인기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '대구 북구 산격동 1397-11',
    },
  ],
  [
    '대전',
    GANGNAM_DATA.대전,
    {
      title: '[대전 서구] 드블랑왁싱 대전둔산점',
      serviceDetails: '상담 후 원하시는 시술 1회 체험권(1인 기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '대전 서구 둔산동 1169 미라클빌딩 401호',
    },
  ],
  [
    '부산',
    GANGNAM_DATA.부산,
    {
      title: '[부산 금정] 스폿라이트 부산대점',
      serviceDetails:
        '취업 사진 or 증명사진 or 컬러증명사진 중 택 1 체험권 (1인 기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '부산 금정구 장전동 419-27',
    },
  ],
  [
    '세종',
    GANGNAM_DATA.세종,
    {
      title: '[세종 나성동] 지금보고싶다 세종나성점',
      serviceDetails:
        '업체 지정메뉴1개 + 주류1병(특이주류불가) 체험권 (2인기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '세종특별자치시 나성동 795',
    },
  ],
  [
    '울산',
    GANGNAM_DATA.울산,
    {
      title: '[울산 남구] 타코야킹',
      serviceDetails: '2인기준 체험권 (가이드라인 참고)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '울산 남구 무거동 847-11',
    },
  ],
  [
    '인천',
    GANGNAM_DATA.인천,
    {
      title: '[인천 강화] 짬뽕강자',
      serviceDetails:
        '탕수육 미니+고추간짜장 +해물짬뽕+추가메뉴1개(요리류 제외) 체험권 (3인기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '인천 강화군 길상면 초지리 1251-494 짬뽕강자',
    },
  ],
  [
    '전남',
    GANGNAM_DATA.전남,
    {
      title: '[전남 함평] 송학면옥(문장리)',
      serviceDetails: '갈비탕 1개 + 물냉면 1개 체험권 (2인기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '전남 함평군 해보면 해삼로 371-6 (문장리)',
    },
  ],
  [
    '전북',
    GANGNAM_DATA.전북,
    {
      title: '[전북 진안] 하이프레시',
      serviceDetails: '3만원 체험권 (2인기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '전북특별자치도 진안군 진안읍 군상리 250',
    },
  ],
  [
    '제주',
    GANGNAM_DATA.제주,
    {
      title: '[제주 제주] 더포레스트애월',
      serviceDetails: '1박 숙박 체험권',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '제주특별자치도 제주시 애월읍 소길리 952-9',
    },
  ],
  [
    '충남',
    GANGNAM_DATA.충남,
    {
      title: '[충남 당진] 패밀리수스튜디오',
      serviceDetails:
        '가족사진 or 증명사진 or 펫사진 or 리마인드웨딩 중 택 1 체험권 (20만원상당)',
      reviewDeadline: getDeadlineDate('09.28 ~ 10.18'),
      location: '충남 당진시 읍내동 1500 1,2층',
    },
  ],
  [
    '충북',
    GANGNAM_DATA.충북,
    {
      title: '[충북 음성] 촨촨썅 꼬치일번가',
      serviceDetails: '4만원 체험권 (2인 기준)',
      reviewDeadline: getDeadlineDate('09.27 ~ 10.17'),
      location: '충북 음성군 맹동면 두성리 1491 106,107호',
    },
  ],
])(
  '%s 지역 강남맛집 본문 내용으로 캠페인 데이터 정제하기',
  (areaName, siteContent, expectResult) => {
    const result = parseGangnamContent(siteContent);

    expect(result).toStrictEqual(expectResult);
  },
);

it('should ', () => {
  console.log(new Date());
});
