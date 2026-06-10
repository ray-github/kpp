import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { fetchCourseDetail, CourseDetail } from '@/services/catalog'
import { addCourseToCart } from '@/services/cart'
import { goToCartWithReturn } from '@/utils/cart-nav'
import { recordBrowseHistory } from '@/services/user-center'
import { ENROLLMENT_NOTICE } from '@/constants/enrollment-notice'
import { useUserStore } from '@/stores/user'
import './index.scss'

const SERVICE_ICONS: Record<string, string> = {
  评价: '💬',
  预约: '📅',
  咨询: '🎧',
  试听: '🎬',
}

export default function CourseDetailPage() {
  const router = useRouter()
  const courseId = router.params.id || ''
  const ensureLogin = useUserStore((s) => s.ensureLogin)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [noticeExpanded, setNoticeExpanded] = useState(true)

  useDidShow(() => {
    if (!courseId) return
    fetchCourseDetail(courseId)
      .then((data) => {
        setCourse(data)
        ensureLogin()
          .then(() => recordBrowseHistory(courseId))
          .catch(() => {})
      })
      .catch(() => {
        Taro.showToast({ title: '课程加载失败', icon: 'none' })
      })
  })

  const handleAddToCart = async (goCart = false) => {
    if (!course) return
    setLoading(true)
    try {
      await ensureLogin()
      await addCourseToCart(course, 1)
      const returnUrl = `/pages/course-detail/index?id=${course.id}`

      if (goCart) {
        Taro.showToast({ title: '已加入购物车', icon: 'success' })
        setTimeout(() => {
          goToCartWithReturn(returnUrl)
        }, 400)
        return
      }

      Taro.showModal({
        title: '加入成功',
        content: '课程已加入购物车',
        confirmText: '去购物车',
        cancelText: '继续浏览',
        success: (res) => {
          if (res.confirm) {
            goToCartWithReturn(returnUrl)
          }
        },
      })
    } catch {
      Taro.showToast({ title: '加入失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    Taro.showToast({ title: '请点击右上角分享', icon: 'none' })
  }

  const handleService = (name: string) => {
    if (name === '预约') {
      Taro.navigateTo({ url: '/pages/appointments/index' })
      return
    }
    if (name === '咨询') {
      Taro.navigateTo({ url: '/pages/customer-service/index' })
      return
    }
    Taro.showToast({ title: `${name}功能开发中`, icon: 'none' })
  }

  const openMap = () => {
    if (!course?.address) {
      Taro.showToast({ title: '暂无地址', icon: 'none' })
      return
    }
    Taro.openLocation({
      latitude: 31.221517,
      longitude: 121.544379,
      name: course.storeName || course.title,
      address: course.address,
    })
  }

  if (!course) {
    return (
      <View className='course-detail page'>
        <View className='course-detail__loading'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='course-detail page'>
      <ScrollView className='course-detail__scroll' scrollY enableFlex>
        <View className='course-detail__hero'>
          {course.coverImage ? (
            <Image
              className='course-detail__cover-image'
              src={course.coverImage}
              mode='aspectFill'
            />
          ) : (
            <View
              className='course-detail__cover-fallback'
              style={{ background: course.coverBg }}
            />
          )}
          <View className='course-detail__hero-mask' />
          <View className='course-detail__hero-actions'>
            <View className='course-detail__hero-btn' onClick={() => handleService('咨询')}>
              <Text>💬</Text>
            </View>
            <View className='course-detail__hero-btn' onClick={handleShare}>
              <Text>↗</Text>
            </View>
          </View>
        </View>

        <View className='course-detail__price-panel'>
          <View className='course-detail__price-row'>
            <Text className='course-detail__price'>
              ¥<Text className='course-detail__price-num'>{course.price.toFixed(2)}</Text>
            </Text>
            {course.originalPrice ? (
              <Text className='course-detail__origin-price'>
                ¥{course.originalPrice.toFixed(2)}
              </Text>
            ) : null}
            <View className='course-detail__coupon-tag'>
              <Text className='course-detail__coupon-text'>新人专享券</Text>
              <Text className='course-detail__coupon-link'>领券 ›</Text>
            </View>
          </View>

          {course.memberPrice ? (
            <View className='course-detail__member-row'>
              <Text className='course-detail__member-icon'>👑</Text>
              <Text className='course-detail__member-text'>
                开通会员 ¥{course.memberPrice}/年 享专属折扣
              </Text>
            </View>
          ) : null}

          <Text className='course-detail__title'>{course.title}</Text>

          <View className='course-detail__info-list'>
            {course.storeName && (
              <View className='course-detail__info-item'>
                <Text className='course-detail__info-icon'>🏫</Text>
                <Text className='course-detail__info-text'>{course.storeName}</Text>
              </View>
            )}
            {course.targetAudience && (
              <View className='course-detail__info-item'>
                <Text className='course-detail__info-icon'>👥</Text>
                <Text className='course-detail__info-text'>{course.targetAudience}</Text>
              </View>
            )}
            {course.address && (
              <View className='course-detail__info-item' onClick={openMap}>
                <Text className='course-detail__info-icon'>📍</Text>
                <Text className='course-detail__info-text course-detail__info-text--link'>
                  {course.address}
                </Text>
                <Text className='course-detail__info-arrow'>›</Text>
              </View>
            )}
            <View className='course-detail__info-item'>
              <Text className='course-detail__info-icon'>🏪</Text>
              <Text className='course-detail__info-text'>平价且服务好</Text>
            </View>
          </View>

          {course.facilityTags?.length ? (
            <View className='course-detail__pill-row'>
              {course.facilityTags.map((tag) => (
                <Text key={tag} className='course-detail__pill course-detail__pill--teal'>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}

          {course.policyTags?.length ? (
            <View className='course-detail__pill-row'>
              {course.policyTags.map((tag) => (
                <Text key={tag} className='course-detail__pill course-detail__pill--purple'>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}

          {course.featureTags?.length ? (
            <View className='course-detail__pill-row'>
              {course.featureTags.map((tag) => (
                <Text key={tag} className='course-detail__pill course-detail__pill--soft'>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}

          {course.serviceTags?.length ? (
            <View className='course-detail__service-row'>
              {course.serviceTags.map((tag) => (
                <View
                  key={tag}
                  className='course-detail__service-item'
                  onClick={() => handleService(tag)}
                >
                  <Text className='course-detail__service-icon'>
                    {SERVICE_ICONS[tag] || '✨'}
                  </Text>
                  <Text className='course-detail__service-label'>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {course.brandName && (
            <View className='course-detail__brand-row'>
              <Text className='course-detail__brand-label'>品牌名：{course.brandName}</Text>
              <Text className='course-detail__brand-arrow'>›</Text>
            </View>
          )}
        </View>

        {course.overview?.length ? (
          <View className='course-detail__section-card'>
            <Text className='course-detail__section-title'>课程概况</Text>
            <View className='course-detail__table'>
              {course.overview.map((row) => (
                <View key={row.label} className='course-detail__table-row'>
                  <Text className='course-detail__table-label'>{row.label}</Text>
                  <Text className='course-detail__table-value'>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {course.syllabus?.length ? (
          <View className='course-detail__section-card'>
            <Text className='course-detail__section-title'>课程大纲</Text>
            <View className='course-detail__syllabus-head'>
              <Text className='course-detail__syllabus-th'>阶段</Text>
              <Text className='course-detail__syllabus-th course-detail__syllabus-th--wide'>
                学习内容
              </Text>
              <Text className='course-detail__syllabus-th'>上课时间</Text>
            </View>
            {course.syllabus.map((row) => (
              <View key={row.phase} className='course-detail__syllabus-row'>
                <Text className='course-detail__syllabus-td'>{row.phase}</Text>
                <Text className='course-detail__syllabus-td course-detail__syllabus-td--wide'>
                  {row.content}
                </Text>
                <Text className='course-detail__syllabus-td course-detail__syllabus-td--time'>
                  {row.time}
                </Text>
              </View>
            ))}
            <Text className='course-detail__more-link'>查看更多大纲 ›</Text>
          </View>
        ) : null}

        <View className='course-detail__section-card'>
          <View className='course-detail__section-head'>
            <Text className='course-detail__section-title'>
              学员评价 ({course.reviewCount || 0})
            </Text>
            <Text className='course-detail__section-link'>查看全部 ›</Text>
          </View>
          <Text className='course-detail__empty-text'>暂无评价</Text>
        </View>

        <View className='course-detail__section-card'>
          <Text className='course-detail__section-title'>师生作品展示</Text>
          <Text className='course-detail__empty-text'>暂无作品展示</Text>
        </View>

        <View className='course-detail__section-card'>
          <Text className='course-detail__section-title'>课程详情</Text>
          {course.detailImage ? (
            <Image
              className='course-detail__detail-image'
              src={course.detailImage}
              mode='widthFix'
            />
          ) : null}
          <Text className='course-detail__desc'>{course.description}</Text>
        </View>

        <View className='course-detail__section-card course-detail__notice'>
          <View
            className='course-detail__notice-head'
            onClick={() => setNoticeExpanded((v) => !v)}
          >
            <Text className='course-detail__section-title course-detail__notice-title'>
              报课须知
            </Text>
            <Text className='course-detail__notice-toggle'>
              {noticeExpanded ? '▲' : '▼'}
            </Text>
          </View>
          {noticeExpanded && (
            <View className='course-detail__notice-body'>
              {ENROLLMENT_NOTICE.map((item) => (
                <View key={item.title} className='course-detail__notice-item'>
                  <Text className='course-detail__notice-item-title'>{item.title}</Text>
                  <Text className='course-detail__notice-item-text'>{item.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className='course-detail__scroll-space' />
      </ScrollView>

      <View className='course-detail__footer'>
        <View className='course-detail__footer-icons'>
          <View className='course-detail__footer-icon-item'>
            <Text className='course-detail__footer-icon'>🏪</Text>
            <Text className='course-detail__footer-icon-label'>商家</Text>
          </View>
          <View
            className='course-detail__footer-icon-item'
            onClick={() => Taro.navigateTo({ url: '/pages/customer-service/index' })}
          >
            <Text className='course-detail__footer-icon'>💬</Text>
            <Text className='course-detail__footer-icon-label'>客服</Text>
          </View>
          <View
            className='course-detail__footer-icon-item'
            onClick={() =>
              goToCartWithReturn(`/pages/course-detail/index?id=${courseId}`)
            }
          >
            <Text className='course-detail__footer-icon'>🛒</Text>
            <Text className='course-detail__footer-icon-label'>购物车</Text>
          </View>
        </View>

        <View className='course-detail__buy-bar'>
          <View
            className={`course-detail__buy-btn course-detail__buy-btn--cart ${loading ? 'course-detail__buy-btn--disabled' : ''}`}
            onClick={() => !loading && handleAddToCart(false)}
          >
            <Text>加入购物车</Text>
          </View>
          <View
            className={`course-detail__buy-btn course-detail__buy-btn--buy ${loading ? 'course-detail__buy-btn--disabled' : ''}`}
            onClick={() => !loading && handleAddToCart(true)}
          >
            <Text>{loading ? '处理中…' : '立即购课'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
