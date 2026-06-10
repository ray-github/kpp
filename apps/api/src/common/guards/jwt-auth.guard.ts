import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: unknown,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('未登录或 token 无效')
    }
    return user
  }
}
