import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { decimalToNumber, generateOrderNo } from '../../common/utils/helpers'

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderSummary(userId: string) {
    const groups = await this.prisma.order.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    })

    const countMap = Object.fromEntries(
      groups.map((item) => [item.status, item._count._all]),
    ) as Record<string, number>

    const refundCount =
      (countMap[OrderStatus.REFUNDING] || 0) + (countMap[OrderStatus.REFUNDED] || 0)

    return {
      all: Object.values(countMap).reduce((sum, n) => sum + n, 0),
      pay: countMap[OrderStatus.PENDING_PAYMENT] || 0,
      use: countMap[OrderStatus.PENDING_USE] || 0,
      review: countMap[OrderStatus.PENDING_REVIEW] || 0,
      refund: refundCount,
    }
  }

  async getOrders(userId: string, status?: OrderStatus | 'REFUND') {
    const statusFilter =
      status === 'REFUND'
        ? { in: [OrderStatus.REFUNDING, OrderStatus.REFUNDED] }
        : status

    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        items: { include: { course: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map((order) => this.formatOrder(order))
  }

  async getOrder(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { course: true } },
      },
    })

    if (!order) throw new NotFoundException('订单不存在')
    return this.formatOrder(order)
  }

  async markReview(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId, status: OrderStatus.PENDING_REVIEW },
    })
    if (!order) throw new NotFoundException('订单不可评价')

    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.COMPLETED },
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 20 } },
    })

    return { success: true }
  }

  async requestRefund(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
        status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_USE] },
      },
    })
    if (!order) throw new BadRequestException('订单不可退款')

    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.REFUNDING },
    })

    return { success: true }
  }

  async createFromCart(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId, selected: true },
      include: { course: true },
    })

    if (cartItems.length === 0) {
      throw new BadRequestException('购物车为空或未选中商品')
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + decimalToNumber(item.course.price) * item.quantity,
      0,
    )

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          orderNo: generateOrderNo(),
          status: OrderStatus.PENDING_USE,
          totalAmount,
          payAmount: totalAmount,
          items: {
            create: cartItems.map((item) => ({
              courseId: item.courseId,
              quantity: item.quantity,
              price: item.course.price,
            })),
          },
        },
        include: {
          items: { include: { course: true } },
        },
      })

      for (const item of cartItems) {
        await tx.enrollment.create({
          data: {
            userId,
            courseId: item.courseId,
            orderId: created.id,
            lessonTotal: 8,
            lessonUsed: 0,
          },
        })
      }

      await tx.cartItem.deleteMany({
        where: { id: { in: cartItems.map((item) => item.id) } },
      })

      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } },
      })

      return created
    })

    return this.formatOrder(order)
  }

  private formatOrder(order: {
    id: string
    orderNo: string
    status: OrderStatus
    totalAmount: { toNumber(): number }
    payAmount: { toNumber(): number }
    createdAt: Date
    items: Array<{
      id: string
      quantity: number
      price: { toNumber(): number }
      course: {
        id: string
        title: string
        subtitle: string | null
        coverBg: string | null
      }
    }>
  }) {
    return {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      totalAmount: decimalToNumber(order.totalAmount),
      payAmount: decimalToNumber(order.payAmount),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: decimalToNumber(item.price),
        course: {
          id: item.course.id,
          title: item.course.title,
          subtitle: item.course.subtitle,
          coverBg: item.course.coverBg,
        },
      })),
    }
  }
}
