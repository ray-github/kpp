import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { WxLoginDto, WxLoginResponseDto } from './dto/wx-login.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wx-login')
  @ApiOperation({ summary: '微信小程序登录' })
  @ApiOkResponse({ type: WxLoginResponseDto })
  async wxLogin(@Body() dto: WxLoginDto) {
    const result = await this.authService.wxLogin(dto.code)
    return {
      token: result.token,
      user: {
        id: result.user.id,
        openid: result.user.openid,
        nickname: result.user.nickname,
        avatar: result.user.avatar,
        phone: result.user.phone,
        points: result.user.points,
        coins: result.user.coins,
      },
    }
  }
}
