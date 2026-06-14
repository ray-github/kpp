import { useState } from 'react'
import { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import { fetchCourseReviews, CourseReview } from '@/services/catalog'
import './index.scss'

export default function CourseReviewsPage() {
  const router = useRouter()
  const courseId = router.params.id || ''
  const [title, setTitle] = useState('')
  const [reviews, setReviews] = useState<CourseReview[]>([])

  useDidShow(() => {
    if (!courseId) return
    fetchCourseReviews(courseId).then((result) => {
      setTitle(result.courseTitle)
      setReviews(result.items)
    })
  })

  return (
    <ScrollView className='course-reviews secondary-page page' scrollY>
      {reviews.length === 0 ? (
        <EmptyState title='暂无评价' subtitle='成为第一个评价这门课的学员吧' />
      ) : (
        <>
          <View className='course-reviews__summary'>
            <Text>{title} · 共 {reviews.length} 条评价</Text>
          </View>
          <View className='course-reviews__list'>
            {reviews.map((review) => (
              <View key={review.id} className='course-reviews__item'>
                <View className='course-reviews__head'>
                  <Text className='course-reviews__user'>{review.userName}</Text>
                  <Text className='course-reviews__rating'>{'★'.repeat(Math.round(review.rating))}</Text>
                </View>
                <Text className='course-reviews__content'>{review.content}</Text>
                <Text className='course-reviews__date'>{review.createdAt}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}
