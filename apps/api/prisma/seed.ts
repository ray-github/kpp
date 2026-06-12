import './load-env'
import { CourseType, PrismaClient } from '@prisma/client'
import { seedBanners, seedCategories, seedCourses } from './seed-data'

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
