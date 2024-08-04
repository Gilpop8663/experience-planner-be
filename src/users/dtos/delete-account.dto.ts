import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteAccountInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class DeleteAccountOutput extends CoreOutput {}
