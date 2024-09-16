import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GetTotalSponsorshipCostAndConsumptionInput {}

@ObjectType()
export class GetTotalSponsorshipCostAndConsumptionOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  totalSponsorshipCost?: number;

  @Field(() => Number, { nullable: true })
  totalConsumptionCost?: number;
}
