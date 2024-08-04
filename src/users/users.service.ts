import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileInput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';
import { logErrorAndReturnFalse } from 'src/utils';
import {
  SendVerifyEmailInput,
  SendVerifyEmailOutput,
} from './dtos/send-verify-email.dto';
import { CheckEmailInput, CheckEmailOutput } from './dtos/check-email.dto';
import {
  CheckNicknameInput,
  CheckNicknameOutput,
} from './dtos/check-nickname.dto';
import {
  DeleteAccountInput,
  DeleteAccountOutput,
} from './dtos/delete-account.dto';
import { PasswordResetToken } from './entities/passwordResetToken.entity';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
} from './dtos/forgot-password.dto';
import {
  ResetPasswordInput,
  ResetPasswordOutput,
} from './dtos/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetToken: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    nickname,
  }: CreateAccountInput): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const existEmail = await this.users.findOne({ where: { email } });
      const existNickname = await this.users.findOne({ where: { nickname } });

      if (existEmail) {
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }

      if (existNickname) {
        return { ok: false, error: '이미 존재하는 닉네임입니다.' };
      }

      const newUser = this.users.create({
        email,
        password,
        nickname,
      });

      await this.users.save(newUser);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '아이디 생성에 실패했습니다.' };
    }
  }

  async login({ email, password }: LoginInput) {
    try {
      const user = await this.users.findOne({
        where: {
          email,
        },
        select: ['password'],
      });

      if (!user) {
        return {
          ok: false,
          error: '입력한 아이디가 존재하지 않습니다.',
        };
      }

      const isPasswordCorrect = await user.checkPassword(password);

      if (!isPasswordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 맞지 않습니다.',
        };
      }

      const token = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return { ok: false, error: '로그인에 실패했습니다.' };
    }
  }

  async getUserProfile({ userId }: UserProfileInput) {
    try {
      const user = await this.users.findOne({
        where: {
          id: userId,
        },
        relations: [],
      });

      if (!user) {
        throw new Error();
      }

      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: '유저를 찾지 못했습니다.',
      };
    }
  }

  async editProfile(
    userId: number,
    { nickname, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({
        where: {
          id: userId,
        },
      });

      if (nickname) {
        user.nickname = nickname;
      }

      if (password) {
        user.password = password;
      }

      await this.users.save(user);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '프로필 변경에 실패했습니다.' };
    }
  }

  async sendVerifyEmail({
    userId,
  }: SendVerifyEmailInput): Promise<SendVerifyEmailOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      const verification = this.verifications.create({ user });

      await this.verifications.save(verification);
      this.mailService.sendVerificationEmail({
        email: user.email,
        nickname: user.nickname,
        code: verification.code,
      });

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '이메일 인증 메일 보내기에 실패했습니다.',
      );
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });

      if (verification) {
        verification.user.verified = true;

        await this.users.update(verification.user.id, {
          verified: true,
          point: verification.user.point + 3000,
        });
        await this.verifications.delete(verification.id);
        return { ok: true };
      }

      return { ok: false, error: '이메일 검증에 실패했습니다.' };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async checkEmail({ email }: CheckEmailInput): Promise<CheckEmailOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });

      if (user) {
        return { ok: false, error: '이미 사용 중인 이메일입니다.' };
      }

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(error, '이메일 중복 확인에 실패했습니다.');
    }
  }

  async checkNickname({
    nickname,
  }: CheckNicknameInput): Promise<CheckNicknameOutput> {
    try {
      const user = await this.users.findOne({ where: { nickname } });

      if (user) {
        return { ok: false, error: '이미 사용 중인 닉네임입니다.' };
      }

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(error, '닉네임 중복 확인에 실패했습니다.');
    }
  }

  async deleteAccount({
    userId,
  }: DeleteAccountInput): Promise<DeleteAccountOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '존재하지 않는 사용자입니다.' };
      }

      await this.users.delete(userId);

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(error, '회원 탈퇴에 실패했습니다.');
    }
  }

  async forgotPassword({
    email,
  }: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

      const token = this.passwordResetToken.create({ user });

      await this.passwordResetToken.save(token);

      this.mailService.sendResetPasswordEmail({
        email: user.email,
        nickname: user.nickname,
        code: token.code,
      });

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '비밀번호 재설정 이메일 전송에 실패했습니다.',
      );
    }
  }

  async resetPassword({
    newPassword,
    code,
  }: ResetPasswordInput): Promise<ResetPasswordOutput> {
    try {
      const token = await this.passwordResetToken.findOne({
        where: { code, expiresAt: MoreThan(new Date()) },
        relations: ['user'],
      });

      if (!token) {
        return { ok: false, error: '토큰이 존재하지 않습니다.' };
      }

      const user = token.user;

      user.password = newPassword;

      await this.users.save(user);
      await this.passwordResetToken.delete(token.id);

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(error, '비밀번호 재설정에 실패했습니다.');
    }
  }
}
