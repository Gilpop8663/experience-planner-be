import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class SendVerifyEmailInput {
  @Field(() => String)
  email: string;
}

@ObjectType()
export class SendVerifyEmailOutput extends CoreOutput {}
