import { PickType } from '@nestjs/graphql';
import { Campaign } from './entities/campaign.entity';

/**
 * [경기 수원] 월화식당 광교점
    3만원 체험권 (2인기준)
    10.17
    경기 수원시 영통구 이의동 1330
 */
export class ParsedGangnamContent extends PickType(Campaign, [
  'title',
  'serviceDetails',
  'reviewDeadline',
  'location',
]) {}
