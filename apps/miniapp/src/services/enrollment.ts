import { request, USE_MOCK } from './request'
import { loadMockEnrollments } from '@/mock/storage'

export interface EnrollmentItem {
  id: string
  status: string
  lessonTotal: number
  lessonUsed: number
  nextLessonAt?: string | null
  course: {
    id: string
    title: string
    subtitle?: string | null
    price: number
    coverBg?: string | null
  }
}

export async function fetchEnrollments() {
  if (USE_MOCK) {
    const items = loadMockEnrollments()
    return {
      total: items.length,
      items: items.map((item) => ({
        id: item.id,
        status: item.status,
        lessonTotal: item.lessonTotal,
        lessonUsed: item.lessonUsed,
        nextLessonAt: item.nextLessonAt,
        course: {
          id: item.course.id,
          title: item.course.title,
          subtitle: item.course.subtitle,
          price: item.course.price,
          coverBg: item.course.coverBg,
        },
      })),
    }
  }

  return request<{ total: number; items: EnrollmentItem[] }>({
    url: '/enrollments',
  })
}
