import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class WxLoginDto {
  @ApiProperty({ description: 'wx.login 返回的 code' })
  @IsString()
  @IsNotEmpty()
  code: string
}

export class WxLoginResponseDto {
  @ApiProperty()
  token: string

  @ApiProperty()
  user: {
    id: string
    openid: string
    nickname: string | null
    avatar: string | null
    phone: string | null
    points: number
    coins: number
  }
}
