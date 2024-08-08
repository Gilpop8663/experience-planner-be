import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class CreateCampaignDirectlyInput extends PickType(Campaign, [
  'title',
  'location',
  'platformName',
  'serviceDetails',
  'reviewDeadline',
  'detailedViewLink',
]) {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class CreateCampaignDirectlyOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  campaignId?: number;
}
