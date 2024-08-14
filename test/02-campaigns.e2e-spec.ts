import * as request from 'supertest';
import { app, campaignRepository, usersRepository } from './jest.setup';
import 'expect-puppeteer';

const GRAPHQL_ENDPOINT = '/graphql';

test.each([
  ['강남맛집', '방문형', 'https://xn--939au0g4vj8sq.net/cp/?id=1461979'],
  ['강남맛집', '배송형', 'https://xn--939au0g4vj8sq.net/cp/?id=1474045'],
  ['레뷰', '방문형', 'https://www.revu.net/campaign/987487'],
  ['레뷰', '배송형', 'https://www.revu.net/campaign/988004'],
  ['리뷰노트', '방문형', 'https://www.reviewnote.co.kr/campaigns/342622'],
  ['리뷰노트', '배송형', 'https://www.reviewnote.co.kr/campaigns/340748'],
  ['미블', '방문형', 'https://www.mrblog.net/campaigns/755759'],
  ['미블', '배송형', 'https://www.mrblog.net/campaigns/752638'],
])(
  '%s 링크를 입력해서 %s 캠페인을 생성한다.',
  async (platformName, deliveryType, detailedViewLink) => {
    const [initialUser] = await usersRepository.find();

    await request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
        mutation {
          createCampaignFromLink(
            input: {
              detailedViewLink: "${detailedViewLink}"
              userId: ${initialUser.id}
            }
          ) {
            ok
            error
            campaignId
          }
        }
      `,
      })
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { createCampaignFromLink },
          },
        } = res;

        expect(createCampaignFromLink.ok).toBe(true);
        expect(createCampaignFromLink.error).toBe(null);
        expect(createCampaignFromLink.campaignId).toEqual(expect.any(Number));
      });

    const initialCampaign = await campaignRepository.findOne({
      where: { detailedViewLink },
    });

    expect(initialCampaign).toBeDefined();
  },
);

test.each([
  [
    '제목1',
    '참고 링크1',
    '플랫폼1',
    new Date(),
    '참고 사항1',
    '주소1',
    100,
    0,
    new Date(),
  ],
  [
    '제목2',
    '참고 링크2',
    '플랫폼2',
    new Date(),
    '참고 사항2',
    '주소2',
    1000,
    20,
    new Date(),
  ],
  ['제목3', '', '', new Date(), '', '', 0, 0, ''],
])(
  '직접 내용을 입력해서 캠페인을 생성한다.',
  async (
    title,
    detailedViewLink,
    platformName,
    reviewDeadline,
    serviceDetails,
    location,
    serviceAmount,
    extraAmount,
    reservationDate,
  ) => {
    const [initialUser] = await usersRepository.find();

    await request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
        mutation {
          createCampaignDirectly(
            input: {
              title: "${title}" 
              platformName: "${platformName}" 
              reviewDeadline: "${reviewDeadline}" 
              serviceDetails: "${serviceDetails}" 
              location: "${location}" 
              detailedViewLink: "${detailedViewLink}"
              serviceAmount: ${serviceAmount}
              userId: ${initialUser.id}
              extraAmount: ${extraAmount}
              reservationDate: "${reservationDate}"
            }
          ) {
            ok
            error
            campaignId
          }
        }
      `,
      })
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { createCampaignDirectly },
          },
        } = res;

        expect(createCampaignDirectly.ok).toBe(true);
        expect(createCampaignDirectly.error).toBe(null);
        expect(createCampaignDirectly.campaignId).toEqual(expect.any(Number));
      });

    const initialCampaign = await campaignRepository.findOne({
      where: { detailedViewLink },
    });

    expect(initialCampaign).toBeDefined();
  },
);

test('캠페인을 삭제할 수 있다. ', async () => {
  const [campaign] = await campaignRepository.find({ relations: ['user'] });

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
      mutation {
        deleteCampaign(input: { campaignId : ${campaign.id}}) {
          ok
          error
        }
      }
    `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { deleteCampaign },
        },
      } = res;

      expect(deleteCampaign.ok).toBe(true);
      expect(deleteCampaign.error).toBe(null);
    });

  const deletedCampaign = await campaignRepository.findOne({
    where: { id: campaign.id },
  });

  expect(deletedCampaign).toBeNull();
});

test('캠페인을 수정할 수 있다. ', async () => {
  const [campaign] = await campaignRepository.find({ relations: ['user'] });

  const EDIT = {
    title: '제목1',
    detailedViewLink: '참고 링크1',
    platformName: '플랫폼1',
    reviewDeadline: new Date(),
    reservationDate: new Date(),
    serviceDetails: '참고 사항1',
    location: '주소1',
    serviceAmount: 100,
    extraAmount: 500,
  };

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
        mutation {
          editCampaign(
            input: {
              campaignId: ${campaign.id}
              detailedViewLink: "${EDIT.detailedViewLink}"
              extraAmount: ${EDIT.extraAmount}
              location: "${EDIT.location}"
              platformName: "${EDIT.platformName}"
              reservationDate: "${EDIT.reservationDate}"
              reviewDeadline: "${EDIT.reviewDeadline}"
              serviceAmount: ${EDIT.serviceAmount}
              serviceDetails: "${EDIT.serviceDetails}"
              title: "${EDIT.title}"
            }
          ) {
            ok
            error
          }
        }
      `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { editCampaign },
        },
      } = res;

      expect(editCampaign.ok).toBe(true);
      expect(editCampaign.error).toBe(null);
    });

  const editedCampaign = await campaignRepository.findOne({
    where: { id: campaign.id },
  });

  expect(editedCampaign.title).toBe(EDIT.title);
  expect(editedCampaign.detailedViewLink).toBe(EDIT.detailedViewLink);
  expect(editedCampaign.location).toBe(EDIT.location);
  expect(editedCampaign.platformName).toBe(EDIT.platformName);
  expect(editedCampaign.reviewDeadline.getTime()).toStrictEqual(
    EDIT.reviewDeadline.setMilliseconds(0),
  );
  expect(editedCampaign.reservationDate.getTime()).toStrictEqual(
    EDIT.reservationDate.setMilliseconds(0),
  );
  expect(editedCampaign.serviceDetails).toBe(EDIT.serviceDetails);
  expect(editedCampaign.serviceAmount).toBe(EDIT.serviceAmount);
  expect(editedCampaign.extraAmount).toBe(EDIT.extraAmount);
});
