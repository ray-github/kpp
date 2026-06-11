import './load-env'
import { CourseType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: '语文', emoji: '📖', bgColor: '#EDE9FE', sortOrder: 1 },
  { name: '数学', emoji: '🔢', bgColor: '#DBEAFE', sortOrder: 2 },
  { name: '物理', emoji: '⚛️', bgColor: '#E0F2FE', sortOrder: 3 },
  { name: '化学', emoji: '🧪', bgColor: '#D1FAE5', sortOrder: 4 },
  { name: '外语', emoji: '🌍', bgColor: '#FEF3C7', sortOrder: 5 },
  { name: '音乐', emoji: '🎵', bgColor: '#FCE7F3', sortOrder: 6 },
  { name: '舞蹈', emoji: '💃', bgColor: '#F3E8FF', sortOrder: 7 },
  { name: '编程', emoji: '💻', bgColor: '#E0E7FF', sortOrder: 8 },
]

const courses = [
  {
    title: '徐汇区小学数学思维提升班',
    subtitle: '逻辑训练 · 举一反三',
    tags: ['思维训练', '小班教学'],
    price: 5280,
    coverBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    coverUrl: '/assets/courses/course-math.png',
    categoryName: '数学',
    city: '上海',
  },
  {
    title: '浦东新区阅读理解与写作精品课',
    subtitle: '夯实基础 · 提升表达',
    tags: ['阅读写作', '名师指导'],
    price: 4680,
    coverBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    coverUrl: '/assets/courses/course-chinese.png',
    categoryName: '语文',
    city: '上海',
  },
  {
    title: '静安区初中物理趣味实验班',
    subtitle: '动手实践 · 理解原理',
    tags: ['实验教学', '竞赛预备'],
    price: 5580,
    coverBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    coverUrl: '/assets/courses/course-physics.png',
    categoryName: '物理',
    city: '上海',
  },
  {
    title: '黄浦区化学启蒙实验室',
    subtitle: '安全实验 · 激发兴趣',
    tags: ['趣味化学', '动手操作'],
    price: 4980,
    coverBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    coverUrl: '/assets/courses/course-chemistry.png',
    categoryName: '化学',
    city: '上海',
  },
  {
    title: '长宁区少儿英语口语精品课',
    subtitle: '情景对话 · 外教互动',
    tags: ['口语', '外教'],
    price: 4580,
    coverBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    coverUrl: '/assets/courses/course-english.png',
    categoryName: '外语',
    city: '上海',
  },
  {
    title: '静安区中国舞启蒙课',
    subtitle: '优美体态从小培养',
    tags: ['舞蹈基础', '4-8岁'],
    price: 2880,
    coverBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    coverUrl: '/assets/courses/course-4.jpg',
    categoryName: '舞蹈',
    city: '上海',
  },
]

const banners = [
  {
    title: '暑期课程嘉年华',
    subtitle: '精选课程 限时优惠',
    imageUrl: '/assets/banners/banner-1.jpg',
    sortOrder: 1,
  },
  {
    title: '名师一对一',
    subtitle: '专属辅导 快速提分',
    imageUrl: '/assets/banners/banner-2.jpg',
    sortOrder: 2,
  },
  {
    title: '全学科畅学',
    subtitle: '语数外物化 一站搞定',
    imageUrl: '/assets/banners/banner-3.jpg',
    sortOrder: 3,
  },
]

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

  for (const item of categories) {
    const created = await prisma.category.create({ data: item })
    categoryMap.set(item.name, created.id)
  }

  for (const item of courses) {
    await prisma.course.create({
      data: {
        title: item.title,
        subtitle: item.subtitle,
        tags: item.tags,
        price: item.price,
        coverBg: item.coverBg,
        coverUrl: item.coverUrl,
        type: CourseType.COURSE,
        categoryId: categoryMap.get(item.categoryName),
        city: item.city,
      },
    })
  }

  await prisma.banner.createMany({ data: banners })

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
