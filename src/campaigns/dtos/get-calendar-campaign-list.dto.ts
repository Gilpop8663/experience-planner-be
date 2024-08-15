import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Campaign } from '../entities/campaign.entity';

@InputType()
export class GetCalendarCampaignListInput {
  @Field(() => Number)
  year: number;

  @Field(() => Number)
  month: number;
}

@ObjectType()
export class GetCalendarCampaignListOutput extends CoreOutput {
  @Field(() => [Campaign], { nullable: true })
  data?: Campaign[];
}
