import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';
import { TokenExpiredError } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    const excludedAuthQueries = [
      'login',
      'checkEmail',
      'checkNickname',
      'verifyEmail',
      'sendVerifyEmail',
      'forgotPassword',
      'createAccount',
    ];

    const isExcludedAuthQuery = excludedAuthQueries.some((path) =>
      req.body.query.includes(path),
    );

    if (isExcludedAuthQuery) {
      next();
      return;
    }

    if (authHeader && typeof authHeader === 'string') {
      // Authorization: Bearer <token>
      const token = authHeader.replace('Bearer ', '').trim();

      try {
        const decoded = this.jwtService.verify(token);

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const result = await this.userService.getUserProfile(decoded['id']);

          if (!result.ok) {
            next();
            return;
          }

          req['user'] = result.user;
        }
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          const graphQLError = new GraphQLError('토큰이 만료되었습니다.', {
            extensions: { code: 'UNAUTHENTICATED' },
          });

          if (req.body.query.includes('RefreshToken')) {
            next();
            return;
          }

          // GraphQL 에러를 직접 응답으로 보냄
          return res.status(401).json({ errors: [graphQLError] });
        }

        console.error('Token verification failed:', error);
      }
    }

    next();
  }
}
