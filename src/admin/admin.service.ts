import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { logErrorAndReturnFalse } from 'src/utils';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUserCount() {
    try {
      const count = await this.userRepository.count();

      return { ok: true, count };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '가입한 유저 수를 확인하는데 실패했습니다.',
      );
    }
  }

  async getActiveUserCount() {
    try {
      const count = await this.userRepository.count({
        where: {
          lastActive: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        }, // 최근 30일 활동한 유저 수
      });
      return { ok: true, count };
    } catch (error) {
      return logErrorAndReturnFalse(
        error,
        '활동 중인 유저 수를 확인하는 데 실패했습니다.',
      );
    }
  }
}
