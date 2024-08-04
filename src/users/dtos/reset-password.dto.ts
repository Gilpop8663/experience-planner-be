import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class ResetPasswordInput {
  @Field(() => String)
  newPassword: string;

  @Field(() => String)
  code: string;
}

@ObjectType()
export class ResetPasswordOutput extends CoreOutput {}
