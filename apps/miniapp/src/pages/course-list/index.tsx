import { useMemo, useState } from 'react'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { getNavBarMetrics } from '@/utils/nav-bar'
import { View, Text, ScrollView, Input, Image } from '@tarojs/components'
import {
  COURSE_LIST_CATEGORIES,
  COURSE_SORT_OPTIONS,
  CourseSortKey,
} from '@/constants/course'
import { fetchCourseList, findCourseListItem } from '@/services/catalog'
import { CourseListItem } from '@/mock/courses'
import {
  chooseMapLocation,
  loadSavedLocation,
  LocationInfo,
} from '@/utils/location'
import './index.scss'

export default function CourseListPage() {
  const router = useRouter()
  const initialCategory = router.params.categoryId || 'all'

  const [location, setLocation] = useState<LocationInfo>(loadSavedLocation())
  const [choosingLocation, setChoosingLocation] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState(initialCategory)
  const [sort, setSort] = useState<CourseSortKey>('default')
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadList = async (
    nextCategory = categoryId,
    nextKeyword = keyword,
    nextSort = sort,
  ) => {
    setLoading(true)
    try {
      const result = await fetchCourseList({
        categoryId: nextCategory,
        keyword: nextKeyword,
        sort: nextSort,
        page: 1,
        pageSize: 20,
      })
      const enriched = result.items.map((item) => {
        const full = findCourseListItem(item.id)
        return full ? { ...full, ...item } : ({ ...item, categoryId: nextCategory } as CourseListItem)
      })
      setCourses(enriched)
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    setLocation(loadSavedLocation())
    if (router.params.categoryId) {
      setCategoryId(router.params.categoryId)
    }
    loadList(router.params.categoryId || categoryId, keyword, sort)
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

  const handleCategoryChange = (id: string) => {
    setCategoryId(id)
    loadList(id, keyword, sort)
  }

  const handleSortChange = (key: CourseSortKey) => {
    setSort(key)
    loadList(categoryId, keyword, key)
  }

  const handleSearch = () => {
    loadList(categoryId, keyword, sort)
  }

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${id}` }).catch(() => {
      Taro.showToast({ title: '页面打开失败，请重新编译', icon: 'none' })
    })
  }

  const displayCourses = useMemo(() => courses, [courses])
  const navMetrics = useMemo(() => getNavBarMetrics(), [])

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: '/pages/home/index' })
    })
  }

  return (
    <View className='course-list page'>
      <View className='course-list__header'>
        <View
          className='course-list__status-bar'
          style={{ height: `${navMetrics.statusBarHeight}px` }}
        />
        <View
          className='course-list__nav-row'
          style={{
            height: `${navMetrics.navContentHeight}px`,
            paddingRight: `${navMetrics.capsulePaddingRight}px`,
          }}
        >
          <View className='course-list__back' onClick={handleBack}>
            <Text className='course-list__back-icon'>‹</Text>
          </View>
          <Text className='course-list__nav-title'>课程</Text>
        </View>
        <View
          className='course-list__location-row'
          style={{ paddingRight: `${navMetrics.capsulePaddingRight}px` }}
        >
          <View className='course-list__location-wrap' onClick={handleChooseLocation}>
            <Text className='course-list__location-dot'>●</Text>
            <Text className='course-list__location-text'>
              {choosingLocation ? '选点中…' : location.label}
            </Text>
          </View>
        </View>
        <View className='course-list__search-bar'>
          <Text className='course-list__search-icon'>🔍</Text>
          <Input
            className='course-list__search-input'
            value={keyword}
            placeholder='搜索课程 / 老师 / 教练'
            placeholderClass='course-list__search-placeholder'
            confirmType='search'
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
      </View>

      <ScrollView className='course-list__categories' scrollX>
        <View className='course-list__categories-inner'>
          {COURSE_LIST_CATEGORIES.map((cat) => (
            <View
              key={cat.id}
              className={`course-list__category ${categoryId === cat.id ? 'course-list__category--active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <Text className='course-list__category-text'>{cat.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className='course-list__sort-row'>
        {COURSE_SORT_OPTIONS.map((item) => (
          <View
            key={item.key}
            className={`course-list__sort ${sort === item.key ? 'course-list__sort--active' : ''}`}
            onClick={() => handleSortChange(item.key)}
          >
            <Text className='course-list__sort-text'>{item.label}</Text>
            {item.key !== 'default' && <Text className='course-list__sort-arrow'>↕</Text>}
          </View>
        ))}
      </View>

      <View
        className='course-list__growth-card'
        onClick={() => Taro.navigateTo({ url: '/pages/growth-card/index' })}
      >
        <View className='course-list__growth-left'>
          <View className='course-list__growth-title-row'>
            <Text className='course-list__growth-title'>课补补成长卡</Text>
            <Text className='course-list__growth-badge'>推荐</Text>
          </View>
          <Text className='course-list__growth-desc'>充值立赠 500 元 · 最高可省约 9.1 折</Text>
        </View>
        <View className='course-list__growth-btn'>
          <Text className='course-list__growth-btn-text'>去充值</Text>
        </View>
      </View>

      <ScrollView className='course-list__scroll' scrollY enableFlex>
        <View className='course-list__list'>
        {loading && displayCourses.length === 0 ? (
          <View className='course-list__empty'>
            <Text>加载中...</Text>
          </View>
        ) : null}

        {displayCourses.map((course) => (
          <View
            key={course.id}
            className='course-list__item'
            onClick={() => goDetail(course.id)}
          >
            {course.coverImage ? (
              <Image
                className='course-list__cover'
                src={course.coverImage}
                mode='aspectFill'
              />
            ) : (
              <View
                className='course-list__cover course-list__cover--fallback'
                style={{ background: course.coverBg }}
              />
            )}
            <View className='course-list__info'>
              <Text className='course-list__title' numberOfLines={2}>
                {course.title}
              </Text>
              <View className='course-list__tags'>
                {course.ageRange && (
                  <Text className='course-list__tag course-list__tag--blue'>
                    {course.ageRange}
                  </Text>
                )}
                {course.institutionName && (
                  <Text className='course-list__tag course-list__tag--gray'>
                    {course.institutionName} ›
                  </Text>
                )}
              </View>
              <View className='course-list__bottom'>
                <Text className='course-list__price'>¥{course.price.toFixed(2)}</Text>
                <View className='course-list__stats'>
                  <Text className='course-list__rating'>★ {course.rating?.toFixed(1) || '0.0'}</Text>
                  <Text className='course-list__enroll'>
                    已报名 {course.enrollCount || 0} 人
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {!loading && displayCourses.length === 0 ? (
          <View className='course-list__empty'>
            <Text>暂无相关课程</Text>
          </View>
        ) : null}

        <View className='course-list__bottom-space' />
        </View>
      </ScrollView>
    </View>
  )
}
