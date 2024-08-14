import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class EditCampaignInput extends PickType(PartialType(Campaign), [
  'title',
  'location',
  'platformName',
  'serviceDetails',
  'reviewDeadline',
  'detailedViewLink',
  'serviceAmount',
  'extraAmount',
  'reservationDate',
]) {
  @Field(() => Number)
  campaignId: number;
}

@ObjectType()
export class EditCampaignOutput extends CoreOutput {}
