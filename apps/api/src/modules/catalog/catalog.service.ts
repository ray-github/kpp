import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CourseType, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'
import { decimalToNumber } from '../../common/utils/helpers'

const CATEGORY_SLUG_MAP: Record<string, string> = {
  chinese: '语文',
  math: '数学',
  physics: '物理',
  chemistry: '化学',
  english: '外语',
  music: '音乐',
  dance: '舞蹈',
  coding: '编程',
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private mapCourseListItem(course: Prisma.CourseGetPayload<{ include: { category: true } }>) {
    return {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      tags: course.tags,
      price: decimalToNumber(course.price),
      originalPrice: course.originalPrice ? decimalToNumber(course.originalPrice) : null,
      coverUrl: course.coverUrl,
      coverBg: course.coverBg,
      type: course.type,
      categoryId: course.categoryId,
      categoryName: course.category?.name,
      rating: course.rating,
      enrollCount: course.enrollCount,
      sales: course.sales,
      ageRange: course.ageRange,
      institutionName: course.institutionName,
      sortOrder: course.sortOrder,
      latitude: course.latitude,
      longitude: course.longitude,
    }
  }

  private mapCourseDetail(course: Prisma.CourseGetPayload<{ include: { category: true } }>) {
    const reviews = Array.isArray(course.reviews) ? course.reviews : []
    return {
      ...this.mapCourseListItem(course),
      detailImageUrl: course.detailImageUrl,
      city: course.city,
      district: course.district,
      address: course.address,
      latitude: course.latitude,
      longitude: course.longitude,
      reviews,
      storeName: course.storeName,
      targetAudience: course.targetAudience,
      brandName: course.brandName,
      memberPrice: course.memberPrice ? decimalToNumber(course.memberPrice) : null,
      description: course.description,
      facilityTags: course.facilityTags,
      serviceTags: course.serviceTags,
      policyTags: course.policyTags,
      featureTags: course.featureTags,
      overview: course.overview,
      syllabus: course.syllabus,
      reviewCount: course.reviewCount,
    }
  }

  private async resolveCategoryId(categoryId?: string) {
    if (!categoryId || categoryId === 'all') return undefined

    const byId = await this.prisma.category.findUnique({ where: { id: categoryId } })
    if (byId) return byId.id

    const categoryName = CATEGORY_SLUG_MAP[categoryId]
    if (!categoryName) return categoryId

    const bySlug = await this.prisma.category.findFirst({ where: { name: categoryName } })
    return bySlug?.id
  }

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
    const resolvedCategoryId = await this.resolveCategoryId(categoryId)

    const where = {
      published: true,
      ...(type ? { type } : {}),
      ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: { category: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: safeSize,
      }),
      this.prisma.course.count({ where }),
    ])

    const items = courses.map((course) => this.mapCourseListItem(course))

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

    return this.mapCourseDetail(course)
  }

  async getCourseReviews(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, published: true },
      select: { reviews: true, reviewCount: true, title: true },
    })

    if (!course) {
      throw new NotFoundException('课程不存在')
    }

    const items = Array.isArray(course.reviews) ? course.reviews : []

    return {
      courseId: id,
      courseTitle: course.title,
      total: course.reviewCount || items.length,
      items,
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
