import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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
import {
  SendVerifyEmailInput,
  SendVerifyEmailOutput,
} from './dtos/send-verify-email.dto';
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
import { Response } from 'express';
import { Cookies } from 'src/auth/cookie.decorator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput, @Context('res') res: Response) {
    return this.usersService.login(loginInput, res);
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

  @Mutation(() => EditProfileOutput)
  @UseGuards(AuthGuard)
  editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput,
  ) {
    return this.usersService.editProfile(user.id, editProfileInput);
  }

  @Mutation(() => SendVerifyEmailOutput)
  sendVerifyEmail(@Args('input') { email }: SendVerifyEmailInput) {
    return this.usersService.sendVerifyEmail({ email });
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(@Args('input') input: VerifyEmailInput) {
    return this.usersService.verifyEmail(input);
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

  @Mutation(() => LoginOutput)
  refreshToken(
    @Cookies() cookies: Record<string, string>,
    @Context('res') res: Response,
  ) {
    // console.log(req);
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return { ok: false, error: '리프레시 토큰이 없습니다.' };
    }

    return this.usersService.refreshToken(refreshToken, res);
  }

  @Mutation(() => CoreOutput)
  logout(@Context('res') res: Response) {
    return this.usersService.logout(res);
  }
}
