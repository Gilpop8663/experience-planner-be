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
  async (platformName, deliveryType, linkUrl) => {
    const [initialUser] = await usersRepository.find();

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
  },
);
