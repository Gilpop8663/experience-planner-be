import { ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@ObjectType()
export class GetUserCountOutput extends CoreOutput {
  @Field({ nullable: true })
  count?: number; // 유저 수
}
