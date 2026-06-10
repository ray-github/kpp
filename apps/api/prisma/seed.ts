import { CourseType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: '语文', emoji: '📖', bgColor: '#EDE9FE', sortOrder: 1 },
  { name: '数学', emoji: '🔢', bgColor: '#DBEAFE', sortOrder: 2 },
  { name: '物理', emoji: '⚛️', bgColor: '#E0F2FE', sortOrder: 3 },
  { name: '化学', emoji: '🧪', bgColor: '#D1FAE5', sortOrder: 4 },
  { name: '外语', emoji: '🌍', bgColor: '#FEF3C7', sortOrder: 5 },
  { name: '舞蹈', emoji: '💃', bgColor: '#F3E8FF', sortOrder: 6 },
]

const courses = [
  {
    title: '徐汇区小学数学思维提升班',
    subtitle: '逻辑训练 · 举一反三',
    tags: ['思维训练', '小班教学'],
    price: 5280,
    coverBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    categoryName: '数学',
  },
  {
    title: '浦东新区阅读理解与写作精品课',
    subtitle: '夯实基础 · 提升表达',
    tags: ['阅读写作', '名师指导'],
    price: 4680,
    coverBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    categoryName: '语文',
  },
  {
    title: '静安区初中物理趣味实验班',
    subtitle: '动手实践 · 理解原理',
    tags: ['实验教学', '竞赛预备'],
    price: 5580,
    coverBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    categoryName: '物理',
  },
  {
    title: '黄浦区化学启蒙实验室',
    subtitle: '安全实验 · 激发兴趣',
    tags: ['趣味化学', '动手操作'],
    price: 4980,
    coverBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    categoryName: '化学',
  },
  {
    title: '长宁区少儿英语口语精品课',
    subtitle: '情景对话 · 外教互动',
    tags: ['口语', '外教'],
    price: 4580,
    coverBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    categoryName: '外语',
  },
  {
    title: '静安区中国舞启蒙课',
    subtitle: '优美体态从小培养',
    tags: ['舞蹈基础', '4-8岁'],
    price: 2880,
    coverBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    categoryName: '舞蹈',
  },
]

async function main() {
  await prisma.userCoupon.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
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
        type: CourseType.COURSE,
        categoryId: categoryMap.get(item.categoryName),
        city: '深圳',
      },
    })
  }

  await prisma.banner.createMany({
    data: [
      {
        title: '夏日嘉年华',
        subtitle: '精选课程 限时优惠',
        bgStyle: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        sortOrder: 1,
      },
      {
        title: '新人专享',
        subtitle: '首单立减 50 元',
        bgStyle: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        sortOrder: 2,
      },
    ],
  })

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
