import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class GetCampaignDetailInput {
  @Field(() => Number)
  campaignId: number;
}

@ObjectType()
export class GetCampaignDetailOutPut extends CoreOutput {
  @Field(() => Campaign, { nullable: true })
  data?: Campaign;
}
