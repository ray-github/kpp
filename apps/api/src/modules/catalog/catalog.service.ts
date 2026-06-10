import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CourseType } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'
import { decimalToNumber } from '../../common/utils/helpers'

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getCategories() {
    const cacheKey = 'catalog:categories'
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    const result = categories.map((item) => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      bg: item.bgColor,
      icon: item.icon,
    }))

    await this.redis.set(cacheKey, JSON.stringify(result), 600)
    return result
  }

  async getCourses(
    type?: CourseType,
    categoryId?: string,
    page = 1,
    pageSize = 10,
  ) {
    const safePage = Math.max(1, page)
    const safeSize = Math.min(50, Math.max(1, pageSize))
    const skip = (safePage - 1) * safeSize

    const where = {
      published: true,
      ...(type ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeSize,
      }),
      this.prisma.course.count({ where }),
    ])

    const items = courses.map((course) => ({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      tags: course.tags,
      price: decimalToNumber(course.price),
      coverUrl: course.coverUrl,
      coverBg: course.coverBg,
      type: course.type,
      categoryId: course.categoryId,
    }))

    return {
      items,
      total,
      page: safePage,
      pageSize: safeSize,
      hasMore: skip + items.length < total,
    }
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, published: true },
      include: { category: true },
    })

    if (!course) {
      throw new NotFoundException('课程不存在')
    }

    return {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      tags: course.tags,
      price: decimalToNumber(course.price),
      coverUrl: course.coverUrl,
      coverBg: course.coverBg,
      type: course.type,
      categoryId: course.categoryId,
      categoryName: course.category?.name,
      city: course.city,
      description: `${course.title}，${course.subtitle || '优质课程'}。平台保障，一课一消，放心报名。`,
    }
  }

  async getBanners() {
    const banners = await this.prisma.banner.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })

    return banners.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      bgStyle: item.bgStyle,
      linkUrl: item.linkUrl,
    }))
  }

  async getNewcomerCoupons() {
    const coupons = await this.prisma.coupon.findMany({
      where: { active: true, newcomer: true },
      orderBy: { amount: 'asc' },
    })

    return coupons.map((item) => ({
      id: item.id,
      amount: decimalToNumber(item.amount),
      title: item.title,
    }))
  }

  async claimCoupon(userId: string, couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon || !coupon.active) {
      throw new NotFoundException('优惠券不存在')
    }

    const existing = await this.prisma.userCoupon.findUnique({
      where: { userId_couponId: { userId, couponId } },
    })

    if (existing) {
      throw new BadRequestException('已领取过该优惠券')
    }

    await this.prisma.userCoupon.create({
      data: { userId, couponId },
    })

    return { success: true }
  }
}
