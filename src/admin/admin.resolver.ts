import { Resolver, Query } from '@nestjs/graphql';
import { AdminService } from './admin.service'; // AdminService 경로에 맞게 수정
import { GetUserCountOutput } from './dtos/get-user-count.dto';
import { GetActiveUserCountOutput } from './dtos/get-active-user-count.dto';
import { AdminGuard } from './admin.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => GetUserCountOutput)
  @UseGuards(AdminGuard)
  async getUserCount() {
    return await this.adminService.getUserCount();
  }

  @Query(() => GetActiveUserCountOutput)
  @UseGuards(AdminGuard)
  async getActiveUserCount() {
    return await this.adminService.getActiveUserCount();
  }
}
