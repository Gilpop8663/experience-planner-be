import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateGangnamCampaignInput {
  @Field(() => String)
  siteContent: string;

  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class CreateGangnamCampaignOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  campaignId?: number;
}
