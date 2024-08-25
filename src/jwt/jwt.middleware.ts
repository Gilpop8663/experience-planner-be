import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (authHeader && typeof authHeader === 'string') {
      // Authorization: Bearer <token>
      const token = authHeader.replace('Bearer ', '').trim();

      try {
        const decoded = this.jwtService.verify(token);

        console.log(decoded);

        if (typeof decoded !== 'object' || !decoded.hasOwnProperty('id')) {
          const user = this.userService.getUserProfile(decoded['id']);
          req['user'] = user;
        }
      } catch (error) {
        // 토큰 검증 실패 시 처리 (예: 로그 출력 등)
        console.error('Token verification failed:', error);
      }
    }

    next();
  }
}
