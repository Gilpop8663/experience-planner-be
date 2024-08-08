import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteCampaignInput {
  @Field(() => Number)
  campaignId: number;
}

@ObjectType()
export class DeleteCampaignOutput extends CoreOutput {}
