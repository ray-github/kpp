import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthUserPayload } from '../../common/decorators/current-user.decorator'

interface WxSessionResponse {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async wxLogin(code: string) {
    const session = await this.code2Session(code)
    const openid = session.openid

    if (!openid) {
      throw new UnauthorizedException('微信登录失败')
    }

    let user = await this.prisma.user.findUnique({ where: { openid } })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openid,
          unionid: session.unionid,
          nickname: `用户${openid.slice(-6)}`,
        },
      })
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      openid: user.openid,
    })

    return { token, user }
  }

  private async code2Session(code: string): Promise<WxSessionResponse> {
    const appId = this.config.get<string>('WECHAT_APPID')
    const secret = this.config.get<string>('WECHAT_SECRET')

    if (!appId || !secret) {
      return {
        openid: `dev_${code || 'mock_openid'}`,
        session_key: 'dev_session_key',
      }
    }

    const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
    url.searchParams.set('appid', appId)
    url.searchParams.set('secret', secret)
    url.searchParams.set('js_code', code)
    url.searchParams.set('grant_type', 'authorization_code')

    const res = await fetch(url)
    const data = (await res.json()) as WxSessionResponse

    if (data.errcode) {
      throw new UnauthorizedException(data.errmsg || '微信登录失败')
    }

    return data
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev-secret',
    })
  }

  validate(payload: AuthUserPayload) {
    return payload
  }
}
