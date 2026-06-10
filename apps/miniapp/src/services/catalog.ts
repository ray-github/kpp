import { request, USE_MOCK } from './request'
import {
  HOME_CATEGORIES,
  HOME_COUPONS,
  CourseCardItem,
} from '@/mock/home'
import {
  COURSE_LIST,
  CourseDetailData,
  CourseListItem,
  getCourseDetail,
} from '@/mock/courses'
import { CourseSortKey } from '@/constants/course'
import banner1 from '@/assets/banners/banner-1.jpg'
import banner2 from '@/assets/banners/banner-2.jpg'
import banner3 from '@/assets/banners/banner-3.jpg'

export interface CategoryItem {
  id: string
  name: string
  emoji?: string
  bg?: string
  icon?: string | null
}

export interface BannerItem {
  id: string
  title: string
  subtitle?: string | null
  bgStyle?: string | null
  imageUrl?: string | null
}

export interface CouponItem {
  id?: string
  amount: number
  claimed?: boolean
  title?: string | null
}

const courseTypeMap = ['COURSE', 'TEACHER', 'COACH'] as const

export interface PaginatedCourses {
  items: CourseCardItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CourseListQuery {
  categoryId?: string
  keyword?: string
  sort?: CourseSortKey
  page?: number
  pageSize?: number
}

function mapCourseItem(item: CourseCardItem & { coverBg?: string; coverImage?: string }): CourseCardItem {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle || '',
    tags: item.tags || [],
    price: item.price,
    coverBg: item.coverBg || 'linear-gradient(135deg, #66ccff 0%, #38bdf8 100%)',
    coverImage: item.coverImage,
  }
}

function sortCourses(items: CourseListItem[], sort: CourseSortKey = 'default') {
  const list = [...items]
  switch (sort) {
    case 'sales':
      return list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
    case 'rating':
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'price':
      return list.sort((a, b) => a.price - b.price)
    default:
      return list
  }
}

export async function fetchCourseList(query: CourseListQuery = {}): Promise<PaginatedCourses> {
  const page = query.page || 1
  const pageSize = query.pageSize || 10
  const sort = query.sort || 'default'

  if (USE_MOCK) {
    let all = [...COURSE_LIST]
    if (query.categoryId && query.categoryId !== 'all') {
      all = all.filter((item) => item.categoryId === query.categoryId)
    }
    if (query.keyword?.trim()) {
      const kw = query.keyword.trim()
      all = all.filter(
        (item) =>
          item.title.includes(kw) ||
          item.institutionName?.includes(kw) ||
          item.subtitle.includes(kw),
      )
    }
    all = sortCourses(all, sort)
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize).map(mapCourseItem)
    return {
      items,
      total: all.length,
      page,
      pageSize,
      hasMore: start + items.length < all.length,
    }
  }

  const params = new URLSearchParams()
  if (query.categoryId) params.set('categoryId', query.categoryId)
  if (query.keyword) params.set('keyword', query.keyword)
  if (query.sort) params.set('sort', query.sort)
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))

  const res = await request<PaginatedCourses>({ url: `/catalog/courses?${params.toString()}` })
  return { ...res, items: res.items.map(mapCourseItem) }
}

export async function fetchCourses(tabIndex = 0): Promise<CourseCardItem[]> {
  const result = await fetchCoursesPage(tabIndex, 1, 50)
  return result.items
}

export async function fetchCoursesPage(
  tabIndex = 0,
  page = 1,
  pageSize = 10,
): Promise<PaginatedCourses> {
  if (USE_MOCK) {
    const all = COURSE_LIST.map(mapCourseItem)
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)
    return {
      items,
      total: all.length,
      page,
      pageSize,
      hasMore: start + items.length < all.length,
    }
  }

  const type = courseTypeMap[tabIndex]
  const res = await request<PaginatedCourses>({
    url: `/catalog/courses?type=${type}&page=${page}&pageSize=${pageSize}`,
  })

  return {
    ...res,
    items: res.items.map(mapCourseItem),
  }
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  if (USE_MOCK) {
    return HOME_CATEGORIES.map(({ id, name, emoji, bg }) => ({
      id,
      name,
      emoji,
      bg,
    }))
  }
  return request<CategoryItem[]>({ url: '/catalog/categories' })
}

export async function fetchBanners(): Promise<BannerItem[]> {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        title: '暑期课程嘉年华',
        subtitle: '精选课程 限时优惠',
        imageUrl: banner1,
      },
      {
        id: '2',
        title: '名师一对一',
        subtitle: '专属辅导 快速提分',
        imageUrl: banner2,
      },
      {
        id: '3',
        title: '全学科畅学',
        subtitle: '语数外物化 一站搞定',
        imageUrl: banner3,
      },
    ]
  }
  return request<BannerItem[]>({ url: '/catalog/banners' })
}

export async function fetchNewcomerCoupons(): Promise<CouponItem[]> {
  if (USE_MOCK) {
    return HOME_COUPONS.map((item, index) => ({
      ...item,
      id: String(index + 1),
    }))
  }
  return request<CouponItem[]>({ url: '/catalog/coupons/newcomer' })
}

export async function claimCoupon(couponId: string) {
  if (USE_MOCK) return { success: true }
  return request({ url: `/catalog/coupons/${couponId}/claim`, method: 'POST' })
}

export type CourseDetail = CourseDetailData

export async function fetchCourseDetail(id: string): Promise<CourseDetail> {
  if (USE_MOCK) {
    return getCourseDetail(id)
  }

  const item = await request<CourseDetail>({ url: `/catalog/courses/${id}` })
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle || '',
    tags: item.tags || [],
    price: item.price,
    coverBg: item.coverBg || 'linear-gradient(135deg, #66ccff 0%, #38bdf8 100%)',
    coverImage: item.coverImage,
    description: item.description,
    categoryName: item.categoryName,
    city: item.city,
    district: item.district,
    address: item.address,
    storeName: item.storeName,
    targetAudience: item.targetAudience,
    brandName: item.brandName,
    memberPrice: item.memberPrice,
    originalPrice: item.originalPrice,
    facilityTags: item.facilityTags,
    serviceTags: item.serviceTags,
    policyTags: item.policyTags,
    featureTags: item.featureTags,
    overview: item.overview,
    syllabus: item.syllabus,
    reviewCount: item.reviewCount,
    detailImage: item.detailImage,
    type: item.type,
    categoryId: item.categoryId,
    rating: item.rating,
    enrollCount: item.enrollCount,
    ageRange: item.ageRange,
    institutionName: item.institutionName,
  }
}

export function findCourseListItem(id: string): CourseListItem | undefined {
  return COURSE_LIST.find((item) => item.id === id)
}
