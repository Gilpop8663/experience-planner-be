import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { logErrorAndReturnFalse } from 'src/utils';
import { Campaign } from './entities/campaign.entity';
import {
  CreateCampaignLinkInput,
  CreateCampaignLinkOutput,
} from './dtos/create-campaign-link.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createCampaignFromLink({
    linkUrl,
    userId,
  }: CreateCampaignLinkInput): Promise<CreateCampaignLinkOutput> {
    try {
      const platformName = this.getPlatformName(linkUrl);

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

      let campaign: Campaign;

      if (platformName === '강남맛집') {
        campaign = await this.getGangnamMatzipCampaign(user, linkUrl);
      } else if (platformName === '레뷰') {
        campaign = await this.getRevuCampaign(user, linkUrl);
      } else if (platformName === '리뷰노트') {
        campaign = await this.getReviewNoteCampaign(user, linkUrl);
      } else if (platformName === '미블') {
        campaign = await this.getMrblogCampaign(user, linkUrl);
      }

      await this.campaignRepository.save(campaign);

      return { ok: true, campaignId: campaign.id };
    } catch (error) {
      console.error(error);
      return logErrorAndReturnFalse(error, '캠페인 생성에 실패했습니다.');
    }
  }

  getPlatformName(linkUrl: string) {
    const parsedLinkUrl = linkUrl.split('https://')[1];

    const SITE_NAME = {
      강남맛집: 'xn--939au0g4vj8sq',
      레뷰: 'www.revu.net',
      리뷰노트: 'reviewnote',
      미블: 'mrblog',
    };

    if (parsedLinkUrl.includes(SITE_NAME.강남맛집)) {
      return '강남맛집';
    }

    if (parsedLinkUrl.includes(SITE_NAME.레뷰)) {
      return '레뷰';
    }

    if (parsedLinkUrl.includes(SITE_NAME.리뷰노트)) {
      return '리뷰노트';
    }

    if (parsedLinkUrl.includes(SITE_NAME.미블)) {
      return '미블';
    }
  }

  async getGangnamMatzipCampaign(user: User, linkUrl: string) {
    const response = await axios.get(linkUrl, {
      headers: {
        setUserAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('.tit', '.textArea').text().trim();
    const thumbnailUrl = $('#img').attr('src');
    const reviewDeadline = this.getDeadlineDate($('dd', '.on').text());
    const serviceDetails = $('.sub_tit', '.textArea').text().trim();
    const location = $('#cont_map').next().text().trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: '강남맛집',
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
        setUserAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
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
    const reviewDeadline = this.getDeadlineDate(deadlineString);
    const serviceDetails = $('.data').eq(2).text().trim();
    const location = $('.map_area').next('.data').text().trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: '미블',
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
        setUserAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('div.text-lg', 'div.w-full').eq(0).text().trim();
    const thumbnailUrl = '';
    const deadlineString = $('div.col-span-7').text().split(' ');
    const parsedDeadlineString = (
      deadlineString[0] +
      deadlineString[2] +
      deadlineString[3]
    ).replaceAll('/', '.');

    const reviewDeadline = this.getDeadlineDate(parsedDeadlineString);
    const serviceDetails = $('p.p-space', 'div.w-full').text().trim();
    const location = $('div.text-lg:contains("방문 주소")')
      .next()
      .text()
      .trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: '리뷰노트',
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

    const title = $('h2').text().trim();
    const thumbnailUrl = $('.campaign-title-img').attr('src');
    const reviewDeadline = this.getDeadlineDate(
      $('.con.ng-binding').eq(2).text(),
    );
    const serviceDetails = $('.ng-binding', '#scrollspy-reward').text().trim();
    const location = $('.desc.address.ng-binding').text().trim();

    const campaign = this.campaignRepository.create({
      user,
      title,
      detailedViewLink: linkUrl,
      platformName: '레뷰',
      thumbnailUrl,
      reviewDeadline,
      serviceDetails,
      location,
    });

    return campaign;
  }

  getDeadlineDate(dateString: string) {
    // "08.23" 부분 추출
    const endDateString = dateString.split('~')[1].trim();

    // 날짜 형식 변환
    const [month, day] = endDateString.split('.').map(Number);
    const currentYear = new Date().getFullYear(); // 현재 연도
    const today = new Date(); // 오늘 날짜

    // Date 객체 생성
    const endDate = new Date(currentYear, month - 1, day, 23, 59, 59); // 월은 0부터 시작하므로 -1

    // 만약 endDate가 오늘 날짜보다 이전이라면, 다음 연도로 설정
    if (endDate < today) {
      endDate.setFullYear(currentYear + 1);
    }

    const koreanEndDate = new Date(endDate.getTime() + 9 * 60 * 60 * 1000); // 9시간 추가

    return koreanEndDate;
  }

  // async deleteSaga({ sagaId }: DeleteSagaInput) {
  //   try {
  //     this.sagaRepository.delete({ id: sagaId });

  //     return { ok: true };
  //   } catch (error) {
  //     return { ok: false, error: '시리즈 삭제에 실패했습니다.' };
  //   }
  // }

  // async editSaga({
  //   sagaId,
  //   description,
  //   thumbnailUrl,
  //   title,
  // }: EditSagaInput): Promise<EditSagaOutput> {
  //   try {
  //     this.sagaRepository.update(sagaId, { title, thumbnailUrl, description });

  //     return { ok: true };
  //   } catch (error) {
  //     return { ok: false, error: '시리즈 수정에 실패했습니다.' };
  //   }
  // }

  // async completeSaga({
  //   sagaId,
  //   isCompleted,
  // }: CompleteSagaInput): Promise<CompleteSagaOutput> {
  //   try {
  //     await this.sagaRepository.update(sagaId, { isCompleted });

  //     return { ok: true };
  //   } catch (error) {
  //     return logErrorAndReturnFalse(error, '시리즈 완결 작업에 실패했습니다');
  //   }
  // }

  // async getSagaList() {
  //   return this.sagaRepository.find({
  //     relations: ['author', 'likes', 'interests'],
  //   });
  // }
}
