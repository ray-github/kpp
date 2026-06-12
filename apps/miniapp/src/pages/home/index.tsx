import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView, Input, Image } from '@tarojs/components'
import { Swiper } from '@nutui/nutui-react-taro'
import CourseCard from '@/components/CourseCard'
import { CourseCardItem, HOME_CATEGORY_ROUTE_MAP } from '@/mock/home'
import {
  fetchBanners,
  fetchCategories,
  fetchRecommendedCourses,
  BannerItem,
  CategoryItem,
} from '@/services/catalog'
import {
  chooseMapLocation,
  loadSavedLocation,
  LocationInfo,
} from '@/utils/location'
import { syncTabBarSelected } from '@/utils/tab-bar'
import './index.scss'

export default function HomePage() {
  const [location, setLocation] = useState<LocationInfo>(loadSavedLocation())
  const [choosingLocation, setChoosingLocation] = useState(false)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [courses, setCourses] = useState<CourseCardItem[]>([])
  const [banners, setBanners] = useState<BannerItem[]>([])

  const loadCourses = async () => {
    const result = await fetchRecommendedCourses(6)
    setCourses(result.items)
  }

  const loadData = async () => {
    const [categoryData, bannerData] = await Promise.all([
      fetchCategories(),
      fetchBanners(),
    ])
    setCategories(categoryData)
    setBanners(bannerData)
    await loadCourses()
  }

  useDidShow(() => {
    syncTabBarSelected()
    setLocation(loadSavedLocation())
    loadData()
  })

  const handleChooseLocation = async () => {
    if (choosingLocation) return
    setChoosingLocation(true)
    try {
      const next = await chooseMapLocation(location)
      setLocation(next)
      Taro.showToast({ title: next.label, icon: 'none' })
    } catch (error) {
      if (error instanceof Error && error.message === 'cancel') return
    } finally {
      setChoosingLocation(false)
    }
  }

  const goCourseList = (categoryId = 'all') => {
    Taro.navigateTo({ url: `/pages/course-list/index?categoryId=${categoryId}` })
  }

  return (
    <ScrollView className='home page' scrollY>
      <View className='home__header'>
        <View className='home__status-bar' />
        <View className='home__top-row'>
          <View className='home__location-wrap' onClick={handleChooseLocation}>
            <Text className='home__location-dot'>●</Text>
            <Text className='home__location'>
              {choosingLocation ? '选点中…' : location.label}
            </Text>
          </View>
          <Text className='home__slogan'>优秀老师 · 平台保障</Text>
        </View>

        <View className='home__search-bar'>
          <Text className='home__search-icon'>🔍</Text>
          <Input
            className='home__search-input'
            placeholder='搜索课程 / 老师 / 教练'
            placeholderClass='home__search-placeholder'
          />
        </View>

        <View className='home__section-title-wrap' onClick={() => goCourseList()}>
          <Text className='home__section-tab-title'>课程</Text>
        </View>
      </View>

      <View className='home__categories-panel'>
        <View className='home__categories-grid'>
          {categories.map((cat) => (
            <View
              key={cat.id}
              className='home__category'
              onClick={() => goCourseList(HOME_CATEGORY_ROUTE_MAP[cat.id] || 'all')}
            >
              <View
                className='home__category-icon'
                style={{ background: cat.bg || undefined }}
              >
                <Text className='home__category-emoji'>{cat.emoji || '📘'}</Text>
              </View>
              <Text className='home__category-name'>{cat.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='home__banner-wrap'>
        <Swiper autoplay indicatorDot className='home__banner'>
          {banners.map((banner) => (
            <Swiper.Item key={banner.id}>
              {banner.imageUrl ? (
                <Image
                  className='home__banner-image'
                  src={banner.imageUrl}
                  mode='aspectFill'
                />
              ) : (
                <View
                  className='home__banner-item'
                  style={{
                    background:
                      banner.bgStyle || 'linear-gradient(135deg, #7C3AED 0%, #38BDF8 100%)',
                  }}
                >
                  <Text className='home__banner-label'>限时活动</Text>
                  <Text className='home__banner-title'>{banner.title}</Text>
                  <Text className='home__banner-sub'>{banner.subtitle}</Text>
                </View>
              )}
            </Swiper.Item>
          ))}
        </Swiper>
      </View>

      <View className='home__feed'>
        <View className='home__section-head'>
          <View className='home__section-head-left'>
            <View className='home__section-dot' />
            <Text className='home__section-title'>为你推荐</Text>
          </View>
        </View>
        <View className='home__feed-grid'>
          {courses.map((course) => (
            <View key={course.id} className='home__feed-item'>
              <CourseCard course={course} />
            </View>
          ))}
        </View>
      </View>

      <View className='home__bottom-space' />
    </ScrollView>
  )
}
