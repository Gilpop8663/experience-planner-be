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
export class CreateCampaignDirectlyInput extends PickType(
  PartialType(Campaign),
  [
    'location',
    'platformName',
    'serviceDetails',
    'detailedViewLink',
    'serviceAmount',
    'extraAmount',
    'reservationDate',
  ],
) {
  @Field(() => String)
  title: string;

  @Field(() => Date)
  reviewDeadline: Date;

  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class CreateCampaignDirectlyOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  campaignId?: number;
}
