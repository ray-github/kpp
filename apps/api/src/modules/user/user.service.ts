import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { decimalToNumber } from '../../common/utils/helpers'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }

  async getProfile(userId: string) {
    const user = await this.getUserOrThrow(userId)
    const couponCount = await this.prisma.userCoupon.count({
      where: { userId, used: false },
    })

    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      points: user.points,
      coins: user.coins,
      isMember: user.isMember,
      growthBalance: decimalToNumber(user.growthBalance),
      couponCount,
    }
  }

  async signIn(userId: string) {
    const user = await this.getUserOrThrow(userId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (user.lastSignInAt && user.lastSignInAt >= today) {
      throw new BadRequestException('今日已签到')
    }

    const reward = 10
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: reward },
        lastSignInAt: new Date(),
      },
    })

    return {
      success: true,
      reward,
      coins: updated.coins,
    }
  }

  async getCoupons(userId: string) {
    const items = await this.prisma.userCoupon.findMany({
      where: { userId },
      include: { coupon: true },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((item) => ({
      id: item.id,
      couponId: item.couponId,
      amount: decimalToNumber(item.coupon.amount),
      title: item.coupon.title,
      used: item.used,
      minAmount: decimalToNumber(item.coupon.minAmount),
      createdAt: item.createdAt,
    }))
  }
}
