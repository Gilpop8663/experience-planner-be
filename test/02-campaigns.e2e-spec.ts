import * as request from 'supertest';
import { app, campaignRepository, usersRepository } from './jest.setup';

const GRAPHQL_ENDPOINT = '/graphql';

test('강남맛집 링크를 입력해서 캠페인을 생성한다.', async () => {
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
    });

  const initialCampaign = await campaignRepository.findOne({
    where: { detailedViewLink: linkUrl },
  });

  expect(initialCampaign).toBeDefined();
});
