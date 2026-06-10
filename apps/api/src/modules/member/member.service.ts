import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { decimalToNumber } from '../../common/utils/helpers'

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async getMemberInfo(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return null

    return {
      isMember: user.isMember,
      growthBalance: decimalToNumber(user.growthBalance),
      benefits: user.isMember
        ? ['单单立减', '双倍积分', '雨伞礼品']
        : ['开通后享单单立减', '双倍积分', '雨伞礼品'],
      rechargeBonusRate: 0.1,
    }
  }

  async activateMember(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isMember: true },
    })

    return {
      success: true,
      isMember: user.isMember,
    }
  }

  async rechargeGrowthCard(userId: string, amount: number) {
    const bonus = Math.floor(amount * 0.1)
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        growthBalance: { increment: amount + bonus },
      },
    })

    return {
      success: true,
      amount,
      bonus,
      growthBalance: decimalToNumber(user.growthBalance),
    }
  }
}
