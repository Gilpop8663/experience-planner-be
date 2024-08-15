import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class GetCampaignListSortedByDeadlineInput {}

@ObjectType()
export class GetCampaignListSortedByDeadlineOutput extends CoreOutput {
  @Field(() => [Campaign], { nullable: true })
  data?: Campaign[];
}
