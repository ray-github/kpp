import courseMath from '@/assets/courses/course-math.png'
import courseChinese from '@/assets/courses/course-chinese.png'
import coursePhysics from '@/assets/courses/course-physics.png'
import courseChemistry from '@/assets/courses/course-chemistry.png'
import courseEnglish from '@/assets/courses/course-english.png'
import courseDance from '@/assets/courses/course-4.jpg'

export interface CategoryItem {
  id: string
  name: string
  emoji: string
  bg: string
}

export interface CouponItem {
  amount: number
  claimed: boolean
}

export interface CourseCardItem {
  id: string
  title: string
  subtitle: string
  tags: string[]
  price: number
  coverBg: string
  coverImage?: string
}

export const HOME_CATEGORY_ROUTE_MAP: Record<string, string> = {
  '1': 'chinese',
  '2': 'math',
  '3': 'physics',
  '4': 'chemistry',
  '5': 'english',
  '6': 'music',
  '7': 'dance',
  '8': 'coding',
}

export const HOME_CATEGORIES: CategoryItem[] = [
  { id: '1', name: '语文', emoji: '📖', bg: '#EDE9FE' },
  { id: '2', name: '数学', emoji: '🔢', bg: '#DBEAFE' },
  { id: '3', name: '物理', emoji: '⚛️', bg: '#E0F2FE' },
  { id: '4', name: '化学', emoji: '🧪', bg: '#D1FAE5' },
  { id: '5', name: '外语', emoji: '🌍', bg: '#FEF3C7' },
  { id: '6', name: '音乐', emoji: '🎵', bg: '#FCE7F3' },
  { id: '7', name: '舞蹈', emoji: '💃', bg: '#F3E8FF' },
  { id: '8', name: '编程', emoji: '💻', bg: '#E0E7FF' },
]

export const HOME_COUPONS: CouponItem[] = [
  { amount: 5, claimed: false },
  { amount: 20, claimed: false },
  { amount: 30, claimed: false },
  { amount: 50, claimed: false },
]

export const HOME_COURSES: CourseCardItem[] = [
  {
    id: '1',
    title: '徐汇区小学数学思维提升班',
    subtitle: '逻辑训练 · 举一反三',
    tags: ['思维训练', '小班教学'],
    price: 5280,
    coverBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    coverImage: courseMath,
  },
  {
    id: '2',
    title: '浦东新区阅读理解与写作精品课',
    subtitle: '夯实基础 · 提升表达',
    tags: ['阅读写作', '名师指导'],
    price: 4680,
    coverBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    coverImage: courseChinese,
  },
  {
    id: '3',
    title: '静安区初中物理趣味实验班',
    subtitle: '动手实践 · 理解原理',
    tags: ['实验教学', '竞赛预备'],
    price: 5580,
    coverBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    coverImage: coursePhysics,
  },
  {
    id: '4',
    title: '黄浦区化学启蒙实验室',
    subtitle: '安全实验 · 激发兴趣',
    tags: ['趣味化学', '动手操作'],
    price: 4980,
    coverBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    coverImage: courseChemistry,
  },
  {
    id: '5',
    title: '长宁区少儿英语口语精品课',
    subtitle: '情景对话 · 外教互动',
    tags: ['口语', '外教'],
    price: 4580,
    coverBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    coverImage: courseEnglish,
  },
  {
    id: '6',
    title: '静安区中国舞启蒙课',
    subtitle: '优美体态从小培养',
    tags: ['舞蹈基础', '4-8岁'],
    price: 2880,
    coverBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    coverImage: courseDance,
  },
]

export const ME_ORDER_TABS = [
  { key: 'all', label: '全部订单', emoji: '📋' },
  { key: 'pay', label: '待付款', emoji: '💳' },
  { key: 'use', label: '待使用', emoji: '📦' },
  { key: 'review', label: '待评价', emoji: '📝' },
  { key: 'refund', label: '退款', emoji: '↩️' },
]

export const ME_QUICK_LINKS = [
  { key: 'history', label: '浏览历史', emoji: '🕐', route: '/pages/browse-history/index' },
  { key: 'appointment', label: '我的预约', emoji: '📅', route: '/pages/appointments/index' },
  { key: 'favorite', label: '收藏', emoji: '⭐', route: '/pages/favorites/index' },
  { key: 'follow', label: '关注', emoji: '👥', route: '/pages/follows/index' },
]

export const ME_SERVICES = [
  { key: 'institution', label: '机构入驻', emoji: '🏫', route: '/pages/merchant-apply/index?type=institution' },
  { key: 'personal', label: '个人入驻', emoji: '👤', route: '/pages/merchant-apply/index?type=personal' },
  { key: 'address', label: '地址管理', emoji: '📍', route: '/pages/address-list/index' },
  { key: 'service', label: '客服', emoji: '💬', route: '/pages/customer-service/index' },
  { key: 'invoice', label: '发票管理', emoji: '🧾', route: '/pages/invoice-list/index' },
  { key: 'bank', label: '银行卡管理', emoji: '🏦', route: '/pages/bank-cards/index' },
]
