import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CompleteReviewAndEndCampaignInput {
  @Field(() => Number)
  campaignId: number;
}

@ObjectType()
export class CompleteReviewAndEndCampaignOutput extends CoreOutput {}
