import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateCampaignLinkInput {
  @Field(() => String)
  linkUrl: string;

  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class CreateCampaignLinkOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  campaignId?: number;
}
