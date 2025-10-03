import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { TokenType } from '@repo/enums';
import { TOKEN_TYPE_KEY } from './RequiredTokenType.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTokenType = this.reflector.getAllAndOverride<TokenType>(
      TOKEN_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const canActivate = (await super.canActivate(context)) as boolean;

    if (!canActivate) {
      return false;
    }

    if (!requiredTokenType) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return user.tokenType === requiredTokenType;
  }
}
