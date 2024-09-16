import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordResetToken } from 'src/users/entities/passwordResetToken.entity';
import { MailService } from 'src/mail/mail.service';
import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';

let app: INestApplication;
let dataSource: DataSource;
let usersRepository: Repository<User>;
let campaignRepository: Repository<Campaign>;
let verificationRepository: Repository<Verification>;
let mailService: MailService;
let passwordResetTokenRepository: Repository<PasswordResetToken>;

const originalError = console.error;

const mockMailService = {
  sendEmail: jest.fn().mockReturnValue(true),
  sendVerificationEmail: jest.fn().mockReturnValue(true),
  sendResetPasswordEmail: jest.fn().mockReturnValue(true),
};

export const TEST_USER_ID = 5;

beforeEach(() => jest.useRealTimers());

beforeAll(async () => {
  const mockAuthGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const gqlContext = GqlExecutionContext.create(context).getContext();
      gqlContext['user'] = {
        id: TEST_USER_ID,
      };

      return true;
    },
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .overrideProvider(MailService)
    .useValue(mockMailService)
    .compile();

  app = moduleFixture.createNestApplication();

  usersRepository = moduleFixture.get<Repository<User>>(
    getRepositoryToken(User),
  );
  campaignRepository = moduleFixture.get<Repository<Campaign>>(
    getRepositoryToken(Campaign),
  );
  passwordResetTokenRepository = moduleFixture.get<
    Repository<PasswordResetToken>
  >(getRepositoryToken(PasswordResetToken));

  verificationRepository = moduleFixture.get<Repository<Verification>>(
    getRepositoryToken(Verification),
  );
  mailService = moduleFixture.get<MailService>(MailService);

  dataSource = moduleFixture.get<DataSource>(DataSource);
  await app.init();

  console.error = (...args) => {
    const errorMessage = args[0] || '';
    if (
      typeof errorMessage === 'string' &&
      (errorMessage.includes('포인트가 부족합니다.') ||
        errorMessage.includes('유효 기간이 남아 구매할 수 없습니다.'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(async () => {
  await dataSource.dropDatabase();
  await dataSource.destroy();

  console.error = originalError;
});

export {
  app,
  dataSource,
  usersRepository,
  campaignRepository,
  mailService,
  verificationRepository,
  passwordResetTokenRepository,
};
