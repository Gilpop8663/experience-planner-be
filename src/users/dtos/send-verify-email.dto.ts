import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class SendVerifyEmailInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class SendVerifyEmailOutput extends CoreOutput {}
