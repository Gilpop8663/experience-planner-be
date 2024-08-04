import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CheckNicknameInput extends PickType(User, ['nickname']) {}

@ObjectType()
export class CheckNicknameOutput extends CoreOutput {}
