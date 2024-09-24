import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileInput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';
import { getRandomNickname, logErrorAndReturnFalse } from 'src/utils';
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
import { Response } from 'express';
import {
  CheckPasswordInput,
  CheckPasswordOutput,
} from './dtos/check-password.dto';
import { cookieDomain } from './constant';

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

  async createAccount({ email, password }: CreateAccountInput): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      let nickname = getRandomNickname();

      const existNickname = await this.users.findOne({ where: { nickname } });
      const existEmail = await this.users.findOne({ where: { email } });
      const verification = await this.verifications.findOne({
        where: { email },
      });

      if (existNickname) {
        nickname = getRandomNickname();
      }

      if (existEmail) {
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }

      if (!verification.verified) {
        return { ok: false, error: '이메일 인증을 받아주세요.' };
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

  async login(
    { email, password, rememberMe }: LoginInput,
    @Res() res: Response,
  ) {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['password', 'id'],
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

      await this.updateLastActive(user.id);

      // 액세스 토큰 생성 (1시간 만료)
      const accessToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '1h' },
      );

      // rememberMe에 따른 리프레시 토큰 만료 시간 설정
      const refreshTokenExpiry = rememberMe ? '7d' : '1h'; // 자동 로그인 시 7일, 그렇지 않으면 1시간

      // 리프레시 토큰 생성
      const refreshToken = this.jwtService.sign(
        { id: user.id, rememberMe },
        { expiresIn: refreshTokenExpiry },
      );

      // 리프레시 토큰을 쿠키에 저장
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // rememberMe에 따른 만료 시간 설정
        domain: cookieDomain,
      });

      return {
        ok: true,
        token: accessToken,
      };
    } catch (error) {
      return { ok: false, error: '로그인에 실패했습니다.' };
    }
  }

  async refreshToken(refreshToken: string, @Res() res: Response) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const result = await this.getUserProfile({ userId: decoded['id'] });

      if (!result.user) {
        return { ok: false, error: '사용자를 찾을 수 없습니다.' };
      }

      const newAccessToken = this.jwtService.sign(
        { id: result.user.id },
        { expiresIn: '1h' },
      );

      await this.updateLastActive(result.user.id);

      const rememberMe = decoded['rememberMe'];

      const refreshTokenExpiry = rememberMe ? '7d' : '1h'; // 자동 로그인 시 7일, 그렇지 않으면 1시간

      const newRefreshToken = this.jwtService.sign(
        { id: result.user.id, rememberMe },
        { expiresIn: refreshTokenExpiry },
      );

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // rememberMe에 따른 만료 시간 설정
        domain: cookieDomain,
      });

      return {
        ok: true,
        token: newAccessToken,
      };
    } catch (error) {
      return { ok: false, error: '유효하지 않은 리프레시 토큰입니다.' };
    }
  }

  async logout(@Res() res: Response) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: cookieDomain,
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '로그아웃에 실패했습니다.',
      };
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
    email,
  }: SendVerifyEmailInput): Promise<SendVerifyEmailOutput> {
    try {
      const existVerification = await this.verifications.findOne({
        where: { email },
      });

      if (existVerification) {
        await this.verifications.delete(existVerification.id);
      }

      const verification = this.verifications.create({ email });

      await this.verifications.save(verification);

      this.mailService.sendVerificationEmail({
        email: email,
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

  async verifyEmail({
    code,
    email,
  }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { email },
      });

      if (verification.code === code) {
        await this.verifications.update(verification.id, { verified: true });

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
      // 닉네임 유효성 검사: 영문, 한글, 숫자만 허용하며, 길이는 2~64자
      const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,64}$/;

      if (!nicknameRegex.test(nickname)) {
        return {
          ok: false,
          error:
            '닉네임은 영문, 한글, 숫자로 구성된 2자리 이상 64자리 이하여야 합니다.',
        };
      }

      const user = await this.users.findOne({ where: { nickname } });

      if (user) {
        return { ok: false, error: '이미 사용 중인 닉네임입니다.' };
      }

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(error, '닉네임 중복 확인에 실패했습니다.');
    }
  }

  async deleteAccount(
    { userId }: DeleteAccountInput,
    @Res() res: Response,
  ): Promise<DeleteAccountOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });

      if (!user) {
        return { ok: false, error: '존재하지 않는 사용자입니다.' };
      }

      await this.users.delete(userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: cookieDomain,
      });

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

  async checkPassword(
    userId: number,
    { password }: CheckPasswordInput,
  ): Promise<CheckPasswordOutput> {
    try {
      const user = await this.users.findOne({
        where: { id: userId },
        select: ['password'],
      });

      const isPasswordCorrect = await user.checkPassword(password);

      if (!isPasswordCorrect) {
        return { ok: false, error: '비밀번호가 맞지 않습니다.' };
      }

      return { ok: true };
    } catch (error) {
      return logErrorAndReturnFalse(error, '비밀번호 확인에 실패했습니다.');
    }
  }

  async createAdminUser() {
    try {
      const ADMIN_EMAIL = 'admin@coddink.com';
      const adminExists = await this.users.findOne({
        where: { email: ADMIN_EMAIL },
      });

      if (adminExists) {
        return;
      }

      const newAdmin = this.users.create({
        email: ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        nickname: '관리자',
        role: UserRole.ADMIN,
      });

      await this.users.save(newAdmin);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '어드민 생성에 실패했습니다.' };
    }
  }

  async updateLastActive(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    await this.users.update(userId, { lastActive: new Date() });
    return { ok: true };
  }
}
