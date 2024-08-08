import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class CreateCampaignLinkInput extends PickType(Campaign, [
  'detailedViewLink',
]) {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class CreateCampaignLinkOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  campaignId?: number;
}
