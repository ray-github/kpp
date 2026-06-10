import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { CourseCardItem } from '@/mock/home'
import './CourseCard.scss'

interface CourseCardProps {
  course: CourseCardItem
}

export default function CourseCard({ course }: CourseCardProps) {
  const goDetail = () => {
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${course.id}` })
  }

  return (
    <View className='course-card' onClick={goDetail}>
      <View
        className='course-card__cover'
        style={course.coverImage ? undefined : { background: course.coverBg }}
      >
        {course.coverImage ? (
          <Image
            className='course-card__cover-image'
            src={course.coverImage}
            mode='aspectFill'
          />
        ) : null}
        <View className='course-card__price-badge'>
          <Text className='course-card__price-unit'>¥</Text>
          <Text className='course-card__price-num'>{course.price}</Text>
        </View>
        <View
          className='course-card__enroll-btn'
          onClick={(e) => {
            e.stopPropagation()
            goDetail()
          }}
        >
          <Text className='course-card__enroll-icon'>+</Text>
        </View>
      </View>

      <View className='course-card__body'>
        <Text className='course-card__title' numberOfLines={2}>
          {course.title}
        </Text>
        <Text className='course-card__subtitle'>{course.subtitle}</Text>
        {course.tags.length > 0 && (
          <View className='course-card__tags'>
            {course.tags.slice(0, 2).map((tag) => (
              <Text key={tag} className='course-card__tag'>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}
