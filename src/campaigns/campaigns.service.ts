import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { logErrorAndReturnFalse } from 'src/utils';
import { Campaign, ExperienceType } from './entities/campaign.entity';
import {
  CreateCampaignLinkInput,
  CreateCampaignLinkOutput,
} from './dtos/create-campaign-link.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

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
      const experienceType =
        $('.type').text() === '방문형'
          ? ExperienceType.visitType
          : ExperienceType.deliveryType;
      const reviewDeadline = this.getDeadlineDate($('dd', '.on').text());
      const serviceDetails = $('.sub_tit', '.textArea').text().trim();
      const location = $('#cont_map').next().text().trim();

      const platformName = this.getPlatformName(linkUrl);

      const campaign = this.campaignRepository.create({
        user,
        title,
        detailedViewLink: linkUrl,
        platformName,
        thumbnailUrl,
        experienceType,
        reviewDeadline,
        serviceDetails,
        location,
      });

      await this.campaignRepository.save(campaign);

      return { ok: true, campaignId: campaign.id };
    } catch (error) {
      return logErrorAndReturnFalse(error, '캠페인 생성에 실패했습니다.');
    }
  }

  getPlatformName(linkUrl: string) {
    const parsedLinkUrl = linkUrl.split('https://')[1];

    const SITE_NAME = {
      강남맛집: 'xn--939au0g4vj8sq',
    };

    if (parsedLinkUrl.includes(SITE_NAME.강남맛집)) {
      return '강남맛집';
    }
  }

  getDeadlineDate(dateString: string) {
    // "08.23" 부분 추출
    const endDateString = dateString.split('~')[1].trim();

    // 날짜 형식 변환
    const [month, day] = endDateString.split('.').map(Number);
    const currentYear = new Date().getFullYear(); // 현재 연도
    const today = new Date(); // 오늘 날짜

    // Date 객체 생성
    const endDate = new Date(currentYear, month - 1, day); // 월은 0부터 시작하므로 -1

    // 만약 endDate가 오늘 날짜보다 이전이라면, 다음 연도로 설정
    if (endDate < today) {
      endDate.setFullYear(currentYear + 1);
    }

    return endDate;
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
