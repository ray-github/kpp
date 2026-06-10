import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { decimalToNumber } from '../../common/utils/helpers'

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getItems(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      quantity: item.quantity,
      selected: item.selected,
      course: {
        id: item.course.id,
        title: item.course.title,
        subtitle: item.course.subtitle,
        price: decimalToNumber(item.course.price),
        coverBg: item.course.coverBg,
        coverUrl: item.course.coverUrl,
      },
    }))
  }

  async addItem(userId: string, courseId: string, quantity: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } })
    if (!course) throw new NotFoundException('课程不存在')

    const item = await this.prisma.cartItem.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, quantity },
      update: { quantity: { increment: quantity } },
      include: { course: true },
    })

    return {
      id: item.id,
      courseId: item.courseId,
      quantity: item.quantity,
      selected: item.selected,
    }
  }

  async updateItem(
    userId: string,
    id: string,
    data: { quantity?: number; selected?: boolean },
  ) {
    const item = await this.prisma.cartItem.findFirst({ where: { id, userId } })
    if (!item) throw new NotFoundException('购物车项不存在')

    return this.prisma.cartItem.update({
      where: { id },
      data,
    })
  }

  async removeItem(userId: string, id: string) {
    const item = await this.prisma.cartItem.findFirst({ where: { id, userId } })
    if (!item) throw new NotFoundException('购物车项不存在')

    await this.prisma.cartItem.delete({ where: { id } })
    return { success: true }
  }
}
