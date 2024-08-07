import * as request from 'supertest';
import { app, campaignRepository, usersRepository } from './jest.setup';
import 'expect-puppeteer';

const GRAPHQL_ENDPOINT = '/graphql';

test('강남맛집 링크를 입력해서 방문형 캠페인을 생성한다.', async () => {
  const [initialUser] = await usersRepository.find();

  const linkUrl = 'https://xn--939au0g4vj8sq.net/cp/?id=1461979';

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
        mutation {
          createCampaignFromLink(
            input: {
              linkUrl: "${linkUrl}"
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
    where: { detailedViewLink: linkUrl },
  });

  expect(initialCampaign).toBeDefined();
});

test('강남맛집 링크를 입력해서 배송형 캠페인을 생성한다.', async () => {
  const [initialUser] = await usersRepository.find();

  const linkUrl = 'https://xn--939au0g4vj8sq.net/cp/?id=1474045';

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
        mutation {
          createCampaignFromLink(
            input: {
              linkUrl: "${linkUrl}"
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
    where: { detailedViewLink: linkUrl },
  });

  expect(initialCampaign).toBeDefined();
});

test('방문형 레뷰 링크를 입력해서 캠페인을 생성한다.', async () => {
  const [initialUser] = await usersRepository.find();

  const linkUrl = 'https://www.revu.net/campaign/987487';

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
        mutation {
          createCampaignFromLink(
            input: {
              linkUrl: "${linkUrl}"
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
    where: { detailedViewLink: linkUrl },
  });

  expect(initialCampaign).toBeDefined();
});

test('배송형 레뷰 링크를 입력해서 캠페인을 생성한다.', async () => {
  const [initialUser] = await usersRepository.find();

  const linkUrl = 'https://www.revu.net/campaign/988004';

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
        mutation {
          createCampaignFromLink(
            input: {
              linkUrl: "${linkUrl}"
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
    where: { detailedViewLink: linkUrl },
  });

  expect(initialCampaign).toBeDefined();
});
