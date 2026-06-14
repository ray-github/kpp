import './load-env'
import { CourseType, Prisma, PrismaClient } from '@prisma/client'
import { seedBanners, seedCategories, seedCourses } from './seed-data'
import { buildSeedReviews, SEED_REVIEW_SNIPPETS } from './review-data'

const COURSE_COORDS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: 31.19515, longitude: 121.43652 },
  2: { latitude: 31.22774, longitude: 121.52201 },
  3: { latitude: 31.22859, longitude: 121.44568 },
  4: { latitude: 31.22439, longitude: 121.46989 },
  5: { latitude: 31.21721, longitude: 121.41789 },
  6: { latitude: 31.23786, longitude: 121.44725 },
}

const prisma = new PrismaClient()

async function main() {
  await prisma.userCoupon.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.browseHistory.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.coupon.deleteMany()

  const categoryMap = new Map<string, string>()

  for (const item of seedCategories) {
    const created = await prisma.category.create({ data: item })
    categoryMap.set(item.name, created.id)
  }

  for (const item of seedCourses) {
    const coords = COURSE_COORDS[item.sortOrder]
    const snippets = SEED_REVIEW_SNIPPETS[item.sortOrder] || []
    await prisma.course.create({
      data: {
        sortOrder: item.sortOrder,
        title: item.title,
        subtitle: item.subtitle,
        tags: item.tags,
        price: item.price,
        originalPrice: item.originalPrice,
        coverBg: item.coverBg,
        coverUrl: item.coverUrl,
        detailImageUrl: item.detailImageUrl,
        type: CourseType.COURSE,
        categoryId: categoryMap.get(item.categoryName),
        city: item.city,
        district: item.district,
        address: item.address,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        reviews: buildSeedReviews(item.reviewCount, snippets) as unknown as Prisma.InputJsonValue,
        storeName: item.storeName,
        institutionName: item.institutionName,
        targetAudience: item.targetAudience,
        brandName: item.brandName,
        memberPrice: item.memberPrice,
        ageRange: item.ageRange,
        rating: item.rating,
        enrollCount: item.enrollCount,
        sales: item.sales,
        reviewCount: item.reviewCount,
        description: item.description,
        facilityTags: item.facilityTags,
        serviceTags: item.serviceTags,
        policyTags: item.policyTags,
        featureTags: item.featureTags,
        overview: item.overview,
        syllabus: item.syllabus,
      },
    })
  }

  await prisma.banner.createMany({ data: seedBanners })

  await prisma.coupon.createMany({
    data: [
      { amount: 5, newcomer: true, title: '新人券 ¥5' },
      { amount: 20, newcomer: true, title: '新人券 ¥20' },
      { amount: 30, newcomer: true, title: '新人券 ¥30' },
      { amount: 50, newcomer: true, title: '新人券 ¥50' },
    ],
  })

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
