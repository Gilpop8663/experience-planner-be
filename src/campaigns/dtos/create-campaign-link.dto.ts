import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class CreateCampaignFromLinkInput extends PickType(Campaign, [
  'detailedViewLink',
]) {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class CreateCampaignFromLinkOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  campaignId?: number;
}
