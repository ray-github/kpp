import Taro from '@tarojs/taro'
import { CourseCardItem, HOME_COUPONS, HOME_COURSES } from './home'
import { COURSE_LIST } from './courses'

const CART_KEY = 'kpp_mock_cart'
const ENROLLMENT_KEY = 'kpp_mock_enrollments'
const ORDERS_KEY = 'kpp_mock_orders'
const USER_EXTRA_KEY = 'kpp_mock_user_extra'
const MY_COUPONS_KEY = 'kpp_mock_my_coupons'
const HISTORY_KEY = 'kpp_mock_history'
const FAVORITES_KEY = 'kpp_mock_favorites'
const FOLLOWS_KEY = 'kpp_mock_follows'
const APPOINTMENTS_KEY = 'kpp_mock_appointments'
const ADDRESSES_KEY = 'kpp_mock_addresses'
const INVOICES_KEY = 'kpp_mock_invoices'
const BANK_CARDS_KEY = 'kpp_mock_bank_cards'
const MERCHANT_APP_KEY = 'kpp_mock_merchant_app'

export interface MockCartItem {
  id: string
  courseId: string
  quantity: number
  selected: boolean
  course: CourseCardItem
}

export interface MockEnrollment {
  id: string
  status: string
  lessonTotal: number
  lessonUsed: number
  nextLessonAt?: string | null
  course: CourseCardItem
}

export interface MockOrder {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  payAmount: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    course: CourseCardItem
  }>
}

export interface MockUserExtra {
  points: number
  coins: number
  isMember: boolean
  growthBalance: number
  lastSignInDate?: string
  couponCount: number
}

export interface MockUserCoupon {
  id: string
  couponId: string
  amount: number
  title: string
  used: boolean
  minAmount: number
  createdAt: string
}

export interface MockHistoryItem {
  id: string
  courseId: string
  viewedAt: string
  course: CourseCardItem
}

export interface MockFavoriteItem {
  id: string
  courseId: string
  createdAt: string
  course: CourseCardItem
}

export interface MockFollowItem {
  id: string
  targetType: string
  targetId: string
  targetName: string
  targetDesc?: string
  createdAt: string
}

export interface MockAppointmentItem {
  id: string
  courseId?: string
  title: string
  appointmentAt: string
  status: string
  remark?: string
  course?: CourseCardItem | null
}

export interface MockAddressItem {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export interface MockInvoiceItem {
  id: string
  title: string
  taxNo?: string
  email?: string
  isDefault: boolean
}

export interface MockBankCardItem {
  id: string
  bankName: string
  cardNoLast4: string
  holderName: string
  isDefault: boolean
}

export interface MockMerchantApplication {
  id: string
  type: string
  name: string
  contact: string
  phone: string
  city?: string
  description?: string
  status: string
  createdAt: string
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function findMockCourse(courseId: string): CourseCardItem | undefined {
  return COURSE_LIST.find((item) => item.id === courseId) || HOME_COURSES.find((item) => item.id === courseId)
}

export function loadMockCart(): MockCartItem[] {
  try {
    return Taro.getStorageSync(CART_KEY) || []
  } catch {
    return []
  }
}

export function saveMockCart(items: MockCartItem[]) {
  Taro.setStorageSync(CART_KEY, items)
}

export function loadMockEnrollments(): MockEnrollment[] {
  try {
    return Taro.getStorageSync(ENROLLMENT_KEY) || []
  } catch {
    return []
  }
}

export function saveMockEnrollments(items: MockEnrollment[]) {
  Taro.setStorageSync(ENROLLMENT_KEY, items)
}

export function loadMockOrders(): MockOrder[] {
  try {
    return Taro.getStorageSync(ORDERS_KEY) || []
  } catch {
    return []
  }
}

export function saveMockOrders(items: MockOrder[]) {
  Taro.setStorageSync(ORDERS_KEY, items)
}

export function loadMockUserExtra(): MockUserExtra {
  const defaults: MockUserExtra = {
    points: 128,
    coins: 56,
    isMember: false,
    growthBalance: 0,
    couponCount: 0,
  }
  try {
    return { ...defaults, ...(Taro.getStorageSync(USER_EXTRA_KEY) || {}) }
  } catch {
    return defaults
  }
}

export function saveMockUserExtra(data: MockUserExtra) {
  Taro.setStorageSync(USER_EXTRA_KEY, data)
}

export function loadMockMyCoupons(): MockUserCoupon[] {
  try {
    return Taro.getStorageSync(MY_COUPONS_KEY) || []
  } catch {
    return []
  }
}

export function saveMockMyCoupons(items: MockUserCoupon[]) {
  Taro.setStorageSync(MY_COUPONS_KEY, items)
}

export function mockAddToCart(course: CourseCardItem, quantity = 1): MockCartItem[] {
  const items = loadMockCart()
  const existing = items.find((item) => item.courseId === course.id)

  if (existing) {
    existing.quantity += quantity
    saveMockCart(items)
    return items
  }

  const next = [
    ...items,
    {
      id: uid('cart'),
      courseId: course.id,
      quantity,
      selected: true,
      course,
    },
  ]
  saveMockCart(next)
  return next
}

export function mockUpdateCartItem(
  id: string,
  data: Partial<Pick<MockCartItem, 'quantity' | 'selected'>>,
): MockCartItem[] {
  const items = loadMockCart().map((item) =>
    item.id === id ? { ...item, ...data } : item,
  )
  saveMockCart(items)
  return items
}

export function mockRemoveCartItem(id: string): MockCartItem[] {
  const items = loadMockCart().filter((item) => item.id !== id)
  saveMockCart(items)
  return items
}

export function mockCheckout(): { totalAmount: number; count: number; orderNo: string } {
  const items = loadMockCart().filter((item) => item.selected)
  if (items.length === 0) {
    throw new Error('未选中商品')
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.course.price * item.quantity,
    0,
  )

  const orderNo = String(Date.now())
  const order: MockOrder = {
    id: uid('order'),
    orderNo,
    status: 'PENDING_USE',
    totalAmount,
    payAmount: totalAmount,
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({
      id: uid('order_item'),
      quantity: item.quantity,
      price: item.course.price,
      course: item.course,
    })),
  }

  const createdEnrollments = items.map((item) => ({
    id: uid('enroll'),
    status: 'ACTIVE',
    lessonTotal: 8,
    lessonUsed: 0,
    nextLessonAt: null,
    course: item.course,
  }))

  saveMockOrders([order, ...loadMockOrders()])
  saveMockEnrollments([...createdEnrollments, ...loadMockEnrollments()])
  saveMockCart(loadMockCart().filter((item) => !item.selected))

  const extra = loadMockUserExtra()
  saveMockUserExtra({ ...extra, points: extra.points + 10 })

  return { totalAmount, count: items.length, orderNo }
}

export function mockOrderSummary() {
  const orders = loadMockOrders()
  return {
    all: orders.length,
    pay: orders.filter((o) => o.status === 'PENDING_PAYMENT').length,
    use: orders.filter((o) => o.status === 'PENDING_USE').length,
    review: orders.filter((o) => o.status === 'PENDING_REVIEW').length,
    refund: orders.filter((o) =>
      ['REFUNDING', 'REFUNDED'].includes(o.status),
    ).length,
  }
}

export function mockGetOrders(status?: string) {
  const orders = loadMockOrders()
  if (!status || status === 'all') return orders
  if (status === 'refund') {
    return orders.filter((o) => ['REFUNDING', 'REFUNDED'].includes(o.status))
  }
  const map: Record<string, string> = {
    pay: 'PENDING_PAYMENT',
    use: 'PENDING_USE',
    review: 'PENDING_REVIEW',
  }
  return orders.filter((o) => o.status === map[status])
}

export function mockSignIn() {
  const extra = loadMockUserExtra()
  if (extra.lastSignInDate === todayKey()) {
    throw new Error('今日已签到')
  }
  const next = {
    ...extra,
    coins: extra.coins + 10,
    lastSignInDate: todayKey(),
  }
  saveMockUserExtra(next)
  return { success: true, reward: 10, coins: next.coins }
}

export function mockClaimCoupon(couponId: string, amount: number, title: string) {
  const coupons = loadMockMyCoupons()
  if (coupons.some((item) => item.couponId === couponId)) {
    throw new Error('已领取过该优惠券')
  }
  const next = [
    {
      id: uid('uc'),
      couponId,
      amount,
      title,
      used: false,
      minAmount: 0,
      createdAt: new Date().toISOString(),
    },
    ...coupons,
  ]
  saveMockMyCoupons(next)
  const extra = loadMockUserExtra()
  saveMockUserExtra({ ...extra, couponCount: next.filter((c) => !c.used).length })
}

export function mockActivateMember() {
  const extra = loadMockUserExtra()
  saveMockUserExtra({ ...extra, isMember: true })
  return { success: true, isMember: true }
}

export function mockRechargeGrowthCard(amount: number) {
  const bonus = Math.floor(amount * 0.1)
  const extra = loadMockUserExtra()
  const growthBalance = extra.growthBalance + amount + bonus
  saveMockUserExtra({ ...extra, growthBalance })
  return { success: true, amount, bonus, growthBalance }
}

export function mockBuildConsumeCode(enrollmentId: string) {
  const slice = enrollmentId.slice(-6).toUpperCase()
  const time = Math.floor(Date.now() / 60000)
  return `KPP${slice}${time}`
}

export function mockGetConsumeCodes() {
  return loadMockEnrollments()
    .filter((item) => item.lessonUsed < item.lessonTotal)
    .map((item) => ({
      enrollmentId: item.id,
      courseTitle: item.course.title,
      remainingLessons: item.lessonTotal - item.lessonUsed,
      code: mockBuildConsumeCode(item.id),
    }))
}

export function mockGetConsumeCode(enrollmentId: string) {
  const enrollment = loadMockEnrollments().find((item) => item.id === enrollmentId)
  if (!enrollment || enrollment.lessonUsed >= enrollment.lessonTotal) {
    throw new Error('课程不存在或已用完')
  }
  return {
    enrollmentId: enrollment.id,
    courseTitle: enrollment.course.title,
    lessonTotal: enrollment.lessonTotal,
    lessonUsed: enrollment.lessonUsed,
    remainingLessons: enrollment.lessonTotal - enrollment.lessonUsed,
    code: mockBuildConsumeCode(enrollment.id),
    refreshedAt: new Date().toISOString(),
  }
}

function loadList<T>(key: string): T[] {
  try {
    return Taro.getStorageSync(key) || []
  } catch {
    return []
  }
}

function saveList<T>(key: string, items: T[]) {
  Taro.setStorageSync(key, items)
}

export function mockGetBrowseHistory(): MockHistoryItem[] {
  return loadList<MockHistoryItem>(HISTORY_KEY)
}

export function mockRecordBrowseHistory(courseId: string) {
  const course = findMockCourse(courseId)
  if (!course) throw new Error('课程不存在')
  const items = mockGetBrowseHistory().filter((item) => item.courseId !== courseId)
  const next = [
    {
      id: uid('hist'),
      courseId,
      viewedAt: new Date().toISOString(),
      course,
    },
    ...items,
  ].slice(0, 50)
  saveList(HISTORY_KEY, next)
  return { success: true }
}

export function mockClearBrowseHistory() {
  saveList(HISTORY_KEY, [])
  return { success: true }
}

export function mockGetFavorites(): MockFavoriteItem[] {
  return loadList<MockFavoriteItem>(FAVORITES_KEY)
}

export function mockAddFavorite(courseId: string) {
  const course = findMockCourse(courseId)
  if (!course) throw new Error('课程不存在')
  const items = mockGetFavorites()
  if (items.some((item) => item.courseId === courseId)) {
    return { success: true }
  }
  saveList(FAVORITES_KEY, [
    {
      id: uid('fav'),
      courseId,
      createdAt: new Date().toISOString(),
      course,
    },
    ...items,
  ])
  return { success: true }
}

export function mockRemoveFavorite(courseId: string) {
  saveList(
    FAVORITES_KEY,
    mockGetFavorites().filter((item) => item.courseId !== courseId),
  )
  return { success: true }
}

export function mockIsFavorite(courseId: string) {
  return { favorited: mockGetFavorites().some((item) => item.courseId === courseId) }
}

export function mockGetFollows(): MockFollowItem[] {
  const items = loadList<MockFollowItem>(FOLLOWS_KEY)
  if (items.length > 0) return items
  const defaults: MockFollowItem[] = [
    {
      id: uid('follow'),
      targetType: 'TEACHER',
      targetId: 't1',
      targetName: '王老师',
      targetDesc: '硬笔书法 · 10年教龄',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('follow'),
      targetType: 'INSTITUTION',
      targetId: 'i1',
      targetName: '阳光艺术中心',
      targetDesc: '美术 · 舞蹈 · 主持',
      createdAt: new Date().toISOString(),
    },
  ]
  saveList(FOLLOWS_KEY, defaults)
  return defaults
}

export function mockRemoveFollow(id: string) {
  saveList(
    FOLLOWS_KEY,
    mockGetFollows().filter((item) => item.id !== id),
  )
  return { success: true }
}

export function mockGetAppointments(): MockAppointmentItem[] {
  const items = loadList<MockAppointmentItem>(APPOINTMENTS_KEY)
  if (items.length > 0) return items
  const course = HOME_COURSES[0]
  const defaults: MockAppointmentItem[] = [
    {
      id: uid('appt'),
      courseId: course.id,
      title: course.title,
      appointmentAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'CONFIRMED',
      remark: '请提前10分钟到达',
      course,
    },
  ]
  saveList(APPOINTMENTS_KEY, defaults)
  return defaults
}

export function mockCreateAppointment(data: {
  courseId?: string
  title: string
  appointmentAt: string
  remark?: string
}) {
  const course = data.courseId ? findMockCourse(data.courseId) : undefined
  const item: MockAppointmentItem = {
    id: uid('appt'),
    courseId: data.courseId,
    title: data.title,
    appointmentAt: data.appointmentAt,
    status: 'PENDING',
    remark: data.remark,
    course: course || null,
  }
  saveList(APPOINTMENTS_KEY, [...mockGetAppointments(), item])
  return { id: item.id, success: true }
}

export function mockCancelAppointment(id: string) {
  saveList(
    APPOINTMENTS_KEY,
    mockGetAppointments().map((item) =>
      item.id === id ? { ...item, status: 'CANCELLED' } : item,
    ),
  )
  return { success: true }
}

export function mockGetAddresses(): MockAddressItem[] {
  return loadList<MockAddressItem>(ADDRESSES_KEY)
}

export function mockSaveAddress(
  data: Omit<MockAddressItem, 'id'> & { id?: string },
): MockAddressItem {
  const items = mockGetAddresses()
  if (data.isDefault) {
    items.forEach((item) => {
      item.isDefault = false
    })
  }
  if (data.id) {
    const next = items.map((item) =>
      item.id === data.id ? ({ ...item, ...data } as MockAddressItem) : item,
    )
    saveList(ADDRESSES_KEY, next)
    return next.find((item) => item.id === data.id)!
  }
  const created: MockAddressItem = { ...data, id: uid('addr') } as MockAddressItem
  saveList(ADDRESSES_KEY, [created, ...items])
  return created
}

export function mockDeleteAddress(id: string) {
  saveList(ADDRESSES_KEY, mockGetAddresses().filter((item) => item.id !== id))
  return { success: true }
}

export function mockGetInvoices(): MockInvoiceItem[] {
  return loadList<MockInvoiceItem>(INVOICES_KEY)
}

export function mockSaveInvoice(
  data: Omit<MockInvoiceItem, 'id'> & { id?: string },
): MockInvoiceItem {
  const items = mockGetInvoices()
  if (data.isDefault) {
    items.forEach((item) => {
      item.isDefault = false
    })
  }
  if (data.id) {
    const next = items.map((item) =>
      item.id === data.id ? ({ ...item, ...data } as MockInvoiceItem) : item,
    )
    saveList(INVOICES_KEY, next)
    return next.find((item) => item.id === data.id)!
  }
  const created: MockInvoiceItem = { ...data, id: uid('inv') } as MockInvoiceItem
  saveList(INVOICES_KEY, [created, ...items])
  return created
}

export function mockDeleteInvoice(id: string) {
  saveList(INVOICES_KEY, mockGetInvoices().filter((item) => item.id !== id))
  return { success: true }
}

export function mockGetBankCards(): MockBankCardItem[] {
  return loadList<MockBankCardItem>(BANK_CARDS_KEY)
}

export function mockAddBankCard(data: {
  bankName: string
  cardNo: string
  holderName: string
  isDefault?: boolean
}) {
  const digits = data.cardNo.replace(/\s/g, '')
  if (digits.length < 16) throw new Error('银行卡号格式不正确')
  const items = mockGetBankCards()
  if (data.isDefault) {
    items.forEach((item) => {
      item.isDefault = false
    })
  }
  const created: MockBankCardItem = {
    id: uid('card'),
    bankName: data.bankName,
    cardNoLast4: digits.slice(-4),
    holderName: data.holderName,
    isDefault: data.isDefault ?? false,
  }
  saveList(BANK_CARDS_KEY, [created, ...items])
  return created
}

export function mockDeleteBankCard(id: string) {
  saveList(BANK_CARDS_KEY, mockGetBankCards().filter((item) => item.id !== id))
  return { success: true }
}

export function mockGetMerchantApplication(): MockMerchantApplication | null {
  try {
    return Taro.getStorageSync(MERCHANT_APP_KEY) || null
  } catch {
    return null
  }
}

export function mockSubmitMerchantApplication(data: {
  type: string
  name: string
  contact: string
  phone: string
  city?: string
  description?: string
}) {
  const existing = mockGetMerchantApplication()
  if (existing?.status === 'PENDING') {
    throw new Error('已有审核中的入驻申请')
  }
  const app: MockMerchantApplication = {
    id: uid('merchant'),
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }
  Taro.setStorageSync(MERCHANT_APP_KEY, app)
  return { id: app.id, status: app.status, success: true }
}

export function mockGetSupportInfo() {
  return {
    hotline: '400-888-6688',
    wechat: 'kpp_service',
    workHours: '周一至周日 9:00-21:00',
    email: 'support@kpp.example.com',
  }
}

export { HOME_COUPONS }
