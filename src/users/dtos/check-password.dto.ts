import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class CheckPasswordOutput extends CoreOutput {}

@InputType()
export class CheckPasswordInput extends PartialType(
  PickType(User, ['password']),
) {}
