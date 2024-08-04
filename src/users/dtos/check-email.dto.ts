import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CheckEmailInput extends PickType(User, ['email']) {}

@ObjectType()
export class CheckEmailOutput extends CoreOutput {}
