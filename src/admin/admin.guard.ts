import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];

    // 유저가 존재하지 않거나, role이 ADMIN이 아니면 false 반환
    if (!user || user.role !== UserRole.ADMIN) {
      return false;
    }

    return true;
  }
}
