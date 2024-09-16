import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GetSponsorshipCostAndConsumptionInput {
  @Field(() => Number)
  year: number;

  @Field(() => Number)
  month: number;
}

@ObjectType()
export class GetSponsorshipCostAndConsumptionOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  sponsorshipCost?: number;

  @Field(() => Number, { nullable: true })
  consumptionCost?: number;
}
