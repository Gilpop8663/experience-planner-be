import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { SendVerifyEmailOutput } from './dtos/send-verify-email.dto';
import {
  CheckNicknameInput,
  CheckNicknameOutput,
} from './dtos/check-nickname.dto';
import { CheckEmailInput, CheckEmailOutput } from './dtos/check-email.dto';
import {
  DeleteAccountInput,
  DeleteAccountOutput,
} from './dtos/delete-account.dto';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
} from './dtos/forgot-password.dto';
import {
  ResetPasswordInput,
  ResetPasswordOutput,
} from './dtos/reset-password.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput) {
    return this.usersService.login(loginInput);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User) {
    return user;
  }

  @Query(() => UserProfileOutput)
  @UseGuards(AuthGuard)
  getUserProfile(@Args('input') userProfileInput: UserProfileInput) {
    return this.usersService.getUserProfile(userProfileInput);
  }

  @Query(() => EditProfileOutput)
  @UseGuards(AuthGuard)
  editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput,
  ) {
    return this.usersService.editProfile(user.id, editProfileInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => SendVerifyEmailOutput)
  sendVerifyEmail(@AuthUser() user: User) {
    return this.usersService.sendVerifyEmail({ userId: user.id });
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(@Args('input') { code }: VerifyEmailInput) {
    return this.usersService.verifyEmail(code);
  }

  @Mutation(() => CheckNicknameOutput)
  checkNickname(@Args('input') input: CheckNicknameInput) {
    return this.usersService.checkNickname(input);
  }

  @Mutation(() => CheckEmailOutput)
  checkEmail(@Args('input') input: CheckEmailInput) {
    return this.usersService.checkEmail(input);
  }

  @Mutation(() => DeleteAccountOutput)
  deleteAccount(@Args('input') input: DeleteAccountInput) {
    return this.usersService.deleteAccount(input);
  }

  @Mutation(() => ForgotPasswordOutput)
  forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return this.usersService.forgotPassword(input);
  }

  @Mutation(() => ResetPasswordOutput)
  resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.usersService.resetPassword(input);
  }
}
