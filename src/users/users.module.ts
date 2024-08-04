import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { Verification } from './entities/verification.entity';
import { PasswordResetToken } from './entities/passwordResetToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, PasswordResetToken])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
