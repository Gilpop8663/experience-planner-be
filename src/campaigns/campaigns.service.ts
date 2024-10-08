import { Injectable } from '@nestjs/common';
import {
  Between,
  IsNull,
  LessThan,
  Like,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { logErrorAndReturnFalse } from 'src/utils';
import { Campaign } from './entities/campaign.entity';
import * as https from 'https';

import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {
  CreateCampaignDirectlyInput,
  CreateCampaignDirectlyOutput,
} from './dtos/create-campaign-directly.dto';
import { PLATFORM_NAME } from './constants';
import {
  DeleteCampaignInput,
  DeleteCampaignOutput,
} from './dtos/delete-campaign.dto';
import {
  EditCampaignInput,
  EditCampaignOutput,
} from './dtos/edit-campaign.dto';
import {
  GetCalendarCampaignListInput,
  GetCalendarCampaignListOutput,
} from './dtos/get-calendar-campaign-list.dto';
import { GetCampaignListSortedByDeadlineOutput } from './dtos/get-campaign-list-sorted-by-deadline.dto';
import { GetExpiredCampaignListSortedByDeadlineOutput } from './dtos/get-expired-campaign-list-sorted-by-deadline.dto';
import {
  CreateCampaignFromLinkInput,
  CreateCampaignFromLinkOutput,
} from './dtos/create-campaign-link.dto';
import {
  GetCampaignDetailInput,
  GetCampaignDetailOutPut,
} from './dtos/get-campaign-detail.dto';
import {
  GetSponsorshipCostAndConsumptionInput,
  GetSponsorshipCostAndConsumptionOutput,
} from './dtos/get-sponsorship-cost-and-consumption.dto';
import { GetTotalSponsorshipCostAndConsumptionOutput } from './dtos/get-total-sponsorship-cost-and-consumption.dto';
import {
  CreateGangnamCampaignInput,
  CreateGangnamCampaignOutput,
} from './dtos/create-gangnam-campaign';
import { getDeadlineDate, getPlatformName, parseGangnamContent } from './utils';
import {
  CompleteReviewAndEndCampaignInput,
  CompleteReviewAndEndCampaignOutput,
} from './dtos/complete-review-and-end-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createCampaignDirectly({
    title,
    reviewDeadline,
    location,
    platformName,
    serviceDetails,
    userId,
    detailedViewLink,
    serviceAmount,
    reservationDate,
    extraAmount,
  }: CreateCampaignDirectlyInput): Promise<CreateCampaignDirectlyOutput> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

      const campaign = this.campaignRepository.create({
        title,
        reviewDeadline,
        thumbnailUrl: '',
        location,
        platformName,
        serviceDetails,
        detailedViewLink,
        serviceAmount,
        user,
        reservationDate:
          new Date(reservationDate).toISOString() === '1970-01-01T00:00:00.000Z'
            ? null
            : reservationDate,
        extraAmount,
      });

      await this.campaignRepository.save(campaign);

      return { ok: true, campaignId: campaign.id };
    } catch (error) {
      return logErrorAndReturnFalse(error, '캠페인 생성에 실패했습니다.');
    }
  }

  async createCampaignFromLink({
    detailedViewLink,
    userId,
  }: CreateCampaignFromLinkInput): Promise<CreateCampaignFromLinkOutput> {
    try {
      const platformName = getPlatformName(detailedViewLink);

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

      let campaign: Campaign;

      if (platformName === PLATFORM_NAME.강남맛집) {
        return {
          ok: false,
          error: `강남맛집 플랫폼은 URL 등록이 지원되지 않습니다. 강남맛집 본문 등록 탭으로 이동해서 진행해주세요.`,
        };
      } else if (platformName === PLATFORM_NAME.레뷰) {
        campaign = await this.getRevuCampaign(user, detailedViewLink);
      } else if (platformName === PLATFORM_NAME.리뷰노트) {
        campaign = await this.getReviewNoteCampaign(user, detailedViewLink);
      } else if (platformName === PLATFORM_NAME.미블) {
        campaign = await this.getMrblogCampaign(user, detailedViewLink);
      }

      await this.campaignRepository.save(campaign);

      return { ok: true, campaignId: campaign.id };
    } catch (error) {
      console.error(error);
      return logErrorAndReturnFalse(error, '캠페인 생성에 실패했습니다.');
    }
  }

  async createGangnamCampaign({
    siteContent,
    userId,
  }: CreateGangnamCampaignInput): Promise<CreateGangnamCampaignOutput> {
    try {
      const { title, location, reviewDeadline, serviceDetails } =
        parseGangnamContent(siteContent);

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

      // 3. 캠페인 생성
      const campaign = this.campaignRepository.create({
        title,
        location,
        reviewDeadline,
        serviceDetails,
        thumbnailUrl: '',
        platformName: PLATFORM_NAME.강남맛집,
        user,
        detailedViewLink: 'https://xn--939au0g4vj8sq.net/',
      });

      // 4. 캠페인 저장
      await this.campaignRepository.save(campaign);

      return { ok: true, campaignId: campaign.id };
    } catch (error) {
      console.error(error);
      return logErrorAndReturnFalse(error, '캠페인 생성에 실패했습니다.');
    }
  }

  async getGangnamMatzipCampaign(user: User, linkUrl: string) {
    const response = await axios.get(linkUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // SSL 무시
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('.tit', '.textArea').text().trim();
    const thumbnailUrl = $('#img').attr('src');
    const deadlineString = $('dt:contains("리뷰 등록기간")')
      .next()
      .text()
      .trim();
    const reviewDeadline = getDeadlineDate(deadlineString);
    const serviceDetails = $('.sub_tit', '.textArea').text().trim();
    const location = $('#cont_map').next().text().trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: PLATFORM_NAME.강남맛집,
      thumbnailUrl,
      reviewDeadline,
      serviceDetails,
      location,
    });

    return campaign;
  }

  async getMrblogCampaign(user: User, linkUrl: string) {
    const response = await axios.get(linkUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('strong.subject', '.sticky_box').text().trim();
    const thumbnailUrl = $('img', '.main_img').attr('src');
    const deadlineString = $('dt:contains("리뷰 기간")', '.info_row')
      .next()
      .text()
      .split('~')

      .map((item) => {
        return item.trim().slice(5);
      })
      .join('~');
    const reviewDeadline = getDeadlineDate(deadlineString);
    const serviceDetails = $('.data').eq(2).text().trim();
    const location = $('.map_area').next('.data').text().trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: PLATFORM_NAME.미블,
      thumbnailUrl,
      reviewDeadline,
      serviceDetails,
      location,
    });

    return campaign;
  }

  async getReviewNoteCampaign(user: User, linkUrl: string) {
    const response = await axios.get(linkUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('div.text-lg', 'div.w-full').eq(0).text().trim();
    const thumbnailUrl = '';
    const deadlineString = $('div.font-bold:contains("리뷰 마감")')
      .eq(0)
      .next()
      .text()
      .split(' ')[0];

    const parsedDeadlineString = `0.0 ~ ${deadlineString.replace('/', '.')}`;

    const reviewDeadline = getDeadlineDate(parsedDeadlineString);
    const serviceDetails = $('p.p-space', 'div.w-full').text().trim();
    const location = $('div.text-lg:contains("방문 주소")')
      .next()
      .text()
      .trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: PLATFORM_NAME.리뷰노트,
      thumbnailUrl,
      reviewDeadline,
      serviceDetails,
      location,
    });

    return campaign;
  }

  async getRevuCampaign(user: User, linkUrl: string) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 768,
    });

    await page.goto(linkUrl);

    const content = await page.content();

    const $ = cheerio.load(content);

    await browser.close();

    const title = $('h2.ng-binding').text().trim();

    const thumbnailUrl = '';
    const reviewDeadline = getDeadlineDate(
      $('div.title:contains("콘텐츠 등록기간")', 'div.mobile-aside')
        .next()
        .text(),
    );
    const serviceDetails = $('p', 'campaign-new-head-info').text().trim();

    const locationString = $('button:contains("주소 복사")').prev().text();

    const location = locationString.length > 0 ? locationString.trim() : '';

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: PLATFORM_NAME.레뷰,
      thumbnailUrl,
      reviewDeadline,
      serviceDetails,
      location,
    });

    return campaign;
  }

  async deleteCampaign({
    campaignId,
  }: DeleteCampaignInput): Promise<DeleteCampaignOutput> {
    try {
      await this.campaignRepository.delete({ id: campaignId });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '캠페인 삭제에 실패했습니다.' };
    }
  }

  async editCampaign({
    campaignId,
    title,
    location,
    extraAmount,
    platformName,
    serviceAmount,
    serviceDetails,
    reviewDeadline,
    detailedViewLink,
    reservationDate,
  }: EditCampaignInput): Promise<EditCampaignOutput> {
    try {
      const updateData: Partial<EditCampaignInput> = {
        title,
        location,
        platformName,
        extraAmount,
        serviceDetails,
        serviceAmount,
        reviewDeadline: reviewDeadline ? reviewDeadline : undefined,
        detailedViewLink,
        reservationDate:
          new Date(reservationDate).toISOString() === '1970-01-01T00:00:00.000Z'
            ? null
            : reservationDate,
      };

      // undefined인 필드 제거
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );

      await this.campaignRepository.update(campaignId, filteredUpdateData);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '시리즈 수정에 실패했습니다.' };
    }
  }

  async getCalendarCampaignList(
    { year, month }: GetCalendarCampaignListInput,
    userId: number,
  ): Promise<GetCalendarCampaignListOutput> {
    try {
      const startDate = new Date(Date.UTC(year, month - 1, 0, 15, 0, 0)); // 9월 1일 00:00:00 KST는 UTC로 8월 31일 15:00:00
      const endDate = new Date(Date.UTC(year, month, 0, 14, 59, 59)); // 9월 30일 23:59:59 KST는 UTC로 9월 30일 14:59:59

      const campaign = await this.campaignRepository.find({
        where: {
          reviewDeadline: Between(startDate, endDate),
          user: { id: userId },
        },
        order: { reviewDeadline: 'ASC' },
      });

      const formattedCampaigns = campaign.map((item) => ({
        ...item,
        isReserved: item.reservationDate ? true : false,
      }));

      return { ok: true, data: formattedCampaigns };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 리스트를 불러오는 데 실패했습니다.',
      );
    }
  }

  async getCampaignListSortedByDeadline(
    userId: number,
  ): Promise<GetCampaignListSortedByDeadlineOutput> {
    try {
      const currentDate = new Date();

      const campaign = await this.campaignRepository.find({
        where: {
          reviewDeadline: MoreThan(currentDate),
          isReviewCompleted: false,
          user: { id: userId },
        },
        order: { reviewDeadline: 'ASC', createdAt: 'ASC' },
      });

      const formattedCampaigns = campaign.map((item) => ({
        ...item,
        isReserved: item.reservationDate ? true : false,
      }));

      return { ok: true, data: formattedCampaigns };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 리스트를 불러오는 데 실패했습니다.',
      );
    }
  }

  async getExpiredCampaignListSortedByDeadline(
    userId: number,
  ): Promise<GetExpiredCampaignListSortedByDeadlineOutput> {
    try {
      const currentDate = new Date();

      const campaign = await this.campaignRepository.find({
        where: [
          {
            reviewDeadline: LessThan(currentDate),
            user: {
              id: userId,
            },
          },
          {
            isReviewCompleted: true,
            user: {
              id: userId,
            },
          },
        ],
        order: { reviewDeadline: 'DESC', createdAt: 'ASC' },
      });

      const formattedCampaigns = campaign.map((item) => ({
        ...item,
        isReserved: item.reservationDate ? true : false,
      }));

      return { ok: true, data: formattedCampaigns };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 리스트를 불러오는 데 실패했습니다.',
      );
    }
  }

  async getCampaignDetail(
    { campaignId }: GetCampaignDetailInput,
    userId: number,
  ): Promise<GetCampaignDetailOutPut> {
    try {
      if (campaignId === 0)
        return {
          ok: false,
          error: '캠페인이 존재하지 않습니다.',
        };

      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
        relations: ['user'],
      });

      if (campaign.user.id !== userId) {
        return {
          ok: false,
          error: '본인이 작성한 캠페인만 조회할 수 있습니다.',
        };
      }

      const currentDate = new Date();

      const [province, district] = campaign.location.split(' '); // 예: '서울 강남구 ~~대로 358'
      const specificLocation = `${province} ${district}`;
      const generalLocation = province;

      // 특정 지역으로 검색
      let nearByCampaign = await this.campaignRepository.find({
        where: {
          location: Like(`%${specificLocation}%`), // '서울 강남구'가 포함된 캠페인 찾기
          reviewDeadline: MoreThan(currentDate),
          isReviewCompleted: false,
          user: { id: userId },
          reservationDate: IsNull(),
        },
      });

      // 특정 지역이 없을 경우 일반 지역으로 검색
      if (nearByCampaign.length === 0) {
        nearByCampaign = await this.campaignRepository.find({
          where: {
            location: Like(`%${generalLocation}%`), // '서울'이 포함된 캠페인 찾기
            reviewDeadline: MoreThan(currentDate),
            isReviewCompleted: false,
            user: { id: userId },
            reservationDate: Not(IsNull()),
          },
        });
      }

      const formattedCampaign = {
        ...campaign,
        isReserved: campaign.reservationDate ? true : false,
      };

      return { ok: true, data: formattedCampaign, nearByCampaign };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 상세 정보를 불러오는 데 실패했습니다.',
      );
    }
  }

  async getSponsorshipCostAndConsumption(
    { month, year }: GetSponsorshipCostAndConsumptionInput,
    userId: number,
  ): Promise<GetSponsorshipCostAndConsumptionOutput> {
    try {
      const startDate = new Date(Date.UTC(year, month - 1, 0, 15, 0, 0)); // 9월 1일 00:00:00 KST는 UTC로 8월 31일 15:00:00
      const endDate = new Date(Date.UTC(year, month, 0, 14, 59, 59)); // 9월 30일 23:59:59 KST는 UTC로 9월 30일 14:59:59

      const campaignList = await this.campaignRepository.find({
        where: {
          user: { id: userId },
          reviewDeadline: Between(startDate, endDate),
        },
      });

      const sponsorshipCost = campaignList.reduce(
        (accumulator, currentCampaign) => {
          return accumulator + currentCampaign.serviceAmount;
        },
        0,
      );

      const consumptionCost = campaignList.reduce(
        (accumulator, currentCampaign) => {
          return accumulator + currentCampaign.extraAmount;
        },
        0,
      );

      return { ok: true, consumptionCost, sponsorshipCost };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 제공받은 금액 및 소비 금액을 불러오는 데 실패했습니다.',
      );
    }
  }

  async getTotalSponsorshipCostAndConsumption(
    userId: number,
  ): Promise<GetTotalSponsorshipCostAndConsumptionOutput> {
    try {
      const campaignList = await this.campaignRepository.find({
        where: {
          user: { id: userId },
        },
      });

      const totalSponsorshipCost = campaignList.reduce(
        (accumulator, currentCampaign) => {
          return accumulator + currentCampaign.serviceAmount;
        },
        0,
      );

      const totalConsumptionCost = campaignList.reduce(
        (accumulator, currentCampaign) => {
          return accumulator + currentCampaign.extraAmount;
        },
        0,
      );

      return { ok: true, totalSponsorshipCost, totalConsumptionCost };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 제공받은 금액 및 소비 금액을 불러오는 데 실패했습니다.',
      );
    }
  }

  async completeReviewAndEndCampaign({
    campaignId,
  }: CompleteReviewAndEndCampaignInput): Promise<CompleteReviewAndEndCampaignOutput> {
    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!campaign) {
        return { ok: false, error: '캠페인을 찾을 수 없습니다.' };
      }

      await this.campaignRepository.update(campaignId, {
        isReviewCompleted: true,
      });

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '캠페인 상태를 변경하는데 실패했습니다.',
      );
    }
  }
}
