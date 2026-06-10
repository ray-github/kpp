import { request, USE_MOCK } from './request'
import { CourseCardItem } from '@/mock/home'
import {
  findMockCourse,
  loadMockCart,
  mockAddToCart,
  mockRemoveCartItem,
  mockUpdateCartItem,
  MockCartItem,
} from '@/mock/storage'

export type CartItem = MockCartItem

export async function fetchCartItems(): Promise<CartItem[]> {
  if (USE_MOCK) return loadMockCart()

  return request<CartItem[]>({ url: '/cart/items' })
}

export async function addCartItem(courseId: string, quantity = 1) {
  if (USE_MOCK) {
    const course = findMockCourse(courseId)
    if (!course) throw new Error('课程不存在')
    mockAddToCart(course, quantity)
    return { success: true }
  }

  return request({
    url: '/cart/items',
    method: 'POST',
    data: { courseId, quantity },
  })
}

export async function addCourseToCart(course: CourseCardItem, quantity = 1) {
  if (USE_MOCK) {
    mockAddToCart(course, quantity)
    return { success: true }
  }

  return addCartItem(course.id, quantity)
}

export async function updateCartItem(
  id: string,
  data: { quantity?: number; selected?: boolean },
) {
  if (USE_MOCK) {
    mockUpdateCartItem(id, data)
    return { success: true }
  }

  return request({
    url: `/cart/items/${id}`,
    method: 'PATCH',
    data,
  })
}

export async function removeCartItem(id: string) {
  if (USE_MOCK) {
    mockRemoveCartItem(id)
    return { success: true }
  }

  return request({
    url: `/cart/items/${id}`,
    method: 'DELETE',
  })
}

export function calcCartTotal(items: CartItem[]) {
  return items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.course.price * item.quantity, 0)
}

export function getSelectedCount(items: CartItem[]) {
  return items.filter((item) => item.selected).length
}

export function isAllSelected(items: CartItem[]) {
  return items.length > 0 && items.every((item) => item.selected)
}
