import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { UserService } from './user.service'
import { MemberService } from '../member/member.service'

class RechargeDto {
  @IsNumber()
  @Min(1)
  amount: number
}

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: '当前用户资料' })
  getProfile(@CurrentUser() user: AuthUserPayload) {
    return this.userService.getProfile(user.sub)
  }

  @Post('sign-in')
  @ApiOperation({ summary: '每日签到领金币' })
  signIn(@CurrentUser() user: AuthUserPayload) {
    return this.userService.signIn(user.sub)
  }

  @Get('coupons')
  @ApiOperation({ summary: '我的优惠券' })
  getCoupons(@CurrentUser() user: AuthUserPayload) {
    return this.userService.getCoupons(user.sub)
  }

  @Get('member')
  @ApiOperation({ summary: '会员信息' })
  getMember(@CurrentUser() user: AuthUserPayload) {
    return this.memberService.getMemberInfo(user.sub)
  }

  @Post('member/activate')
  @ApiOperation({ summary: '开通会员（模拟）' })
  activateMember(@CurrentUser() user: AuthUserPayload) {
    return this.memberService.activateMember(user.sub)
  }

  @Post('growth-card/recharge')
  @ApiOperation({ summary: '成长卡充值（模拟）' })
  rechargeGrowthCard(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: RechargeDto,
  ) {
    return this.memberService.rechargeGrowthCard(user.sub, dto.amount)
  }
}
