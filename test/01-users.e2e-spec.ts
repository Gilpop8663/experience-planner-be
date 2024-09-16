import * as request from 'supertest';
import {
  app,
  mailService,
  passwordResetTokenRepository,
  usersRepository,
  verificationRepository,
} from './jest.setup';

const GRAPHQL_ENDPOINT = '/graphql';

const TEST_USER = {
  email: 'asdf1234@naver.com',
  password: '12341234',
};

describe('AppController (e2e)', () => {
  beforeAll(async () => {
    const createUser = async ({ email, password }) => {
      await verificationRepository.save(
        verificationRepository.create({ email, verified: true }),
      );

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
          mutation {
            createAccount(
              input: { email: "${email}",
                password: "${password}",  }
            ) {
              ok
              error
            }
          }
        `,
        });
    };

    for (let index = 0; index < 5; index++) {
      await createUser({
        email: index,
        password: index,
      });
    }

    await usersRepository.update(1, { point: 3000 });
    await usersRepository.update(2, { point: 3000 });
  });

  describe('아이디 생성', () => {
    test('아이디를 생성한다.', async () => {
      await verificationRepository.save(
        verificationRepository.create({
          email: TEST_USER.email,
          verified: true,
        }),
      );

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              createAccount(
                input: { email: "${TEST_USER.email}",
                  password: "${TEST_USER.password}",  }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;

          expect(createAccount.ok).toBe(true);
          expect(createAccount.error).toBe(null);
        });
    });

    test('중복된 이메일을 입력했을 때 생성되지 않는다.', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              createAccount(
                input: { email: "${TEST_USER.email}",
                  password: "${TEST_USER.password}",  }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;

          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toBe('이미 존재하는 이메일입니다.');
        });
    });
  });

  describe('로그인', () => {
    test('로그인한다 ', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
          mutation {
            login(input: { password: "${TEST_USER.password}", email: "${TEST_USER.email}" }) {
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
        });
    });

    test('잘못된 비밀번호로 로그인을 시도한다.', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
          mutation {
            login(input: { password: "test", email: "${TEST_USER.email}" }) {
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(false);
          expect(login.error).toBe('비밀번호가 맞지 않습니다.');
          expect(login.token).toEqual(null);
        });
    });
  });

  test(`유저 정보를 조회했을 때 아이디, 포인트, 내이야기, 닉네임, 
    이메일, 댓글, 관심 이야기, 좋아요를 누른 작품이나 회차를 알 수 있다.`, async () => {
    const [initialUser] = await usersRepository.find({
      relations: [],
    });

    const requiredKeys = ['id', 'createdAt', 'updatedAt', 'email', 'nickname'];

    expect(initialUser).toEqual(expect.any(Object));

    requiredKeys.forEach((key) => {
      expect(initialUser).toHaveProperty(key);
    });
  });
});

test('닉네임을 중복 확인 한다. 중복이라면 결과는 false를 반환한다.', async () => {
  const [user] = await usersRepository.find();

  return request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
      mutation {
        checkNickname(input: { nickname: "${user.nickname}" }) {
          ok
          error
        }
      }
    `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { checkNickname },
        },
      } = res;

      expect(checkNickname.ok).toBe(false);
      expect(checkNickname.error).toBe('이미 사용 중인 닉네임입니다.');
    });
});

test.each([
  [`asd${TEST_USER.email}`, true, null],
  [TEST_USER.email, false, '이미 사용 중인 이메일입니다.'],
])(
  '이메일: %s를 중복 확인 한다. 중복 확인에 결과는 %s를 반환한다.',
  (email, result, errorResult) => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
      mutation {
        checkEmail(input: { email: "${email}" }) {
          ok
          error
        }
      }
    `,
      })
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { checkEmail },
          },
        } = res;

        expect(checkEmail.ok).toBe(result);
        expect(checkEmail.error).toBe(errorResult);
      });
  },
);

test('회원이 탈퇴한다.', async () => {
  const initialUser = await usersRepository.findOne({ where: { point: 0 } });

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
    mutation {
      deleteAccount(input: { userId: ${initialUser.id} }) {
        ok
        error
      }
    }
  `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { deleteAccount },
        },
      } = res;

      expect(deleteAccount.ok).toBe(true);
      expect(deleteAccount.error).toBe(null);
    });

  const updatedUser = await usersRepository.findOne({
    where: { id: initialUser.id },
  });

  expect(updatedUser).toBe(null);
});

test('비밀번호 찾기를 한다. 이메일로 토큰이 담긴 링크를 보내 재설정할 수 있도록 한다.', async () => {
  const [initialUser] = await usersRepository.find();

  // 1. 비밀번호 찾기 요청을 보냅니다.
  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
     mutation {
       forgotPassword(input: { email: "${initialUser.email}" }) {
         ok
         error
       }
     }
   `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { forgotPassword },
        },
      } = res;

      expect(forgotPassword.ok).toBe(true);
      expect(forgotPassword.error).toBe(null);
    });

  const [token] = await passwordResetTokenRepository.find();

  // 2. 이메일로 토큰이 담긴 링크가 전송되었는지 확인합니다.
  expect(mailService.sendResetPasswordEmail).toHaveBeenCalled();
  expect(mailService.sendResetPasswordEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      email: initialUser.email,
      nickname: initialUser.nickname,
      code: token.code,
    }),
  );

  const newPassword = 'newPassword123';

  //   // 3. 토큰을 사용하여 새 비밀번호를 설정합니다.
  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
      mutation {
        resetPassword(input: { code: "${token.code}", newPassword: "${newPassword}" }) {
          ok
          error
        }
      }
    `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { resetPassword },
        },
      } = res;

      expect(resetPassword.ok).toBe(true);
      expect(resetPassword.error).toBe(null);
    });

  // 4. 새 비밀번호로 로그인하여 비밀번호가 제대로 변경되었는지 확인합니다.
  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
    mutation {
      login(input: { email: "${initialUser.email}", password: "${newPassword}" }) {
        ok
        token
        error
      }
    }
  `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { login },
        },
      } = res;
      expect(login.ok).toBe(true);
      expect(login.token).toBeDefined();
      expect(login.error).toBe(null);
    });
});
