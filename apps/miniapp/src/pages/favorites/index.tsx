import { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import CourseCard from '@/components/CourseCard'
import EmptyState from '@/components/EmptyState'
import { fetchFavorites, removeFavorite, MockFavoriteItem } from '@/services/user-center'
import './index.scss'

export default function FavoritesPage() {
  const [items, setItems] = useState<MockFavoriteItem[]>([])

  useDidShow(() => {
    fetchFavorites().then(setItems)
  })

  const handleRemove = async (courseId: string) => {
    await removeFavorite(courseId)
    setItems((prev) => prev.filter((item) => item.courseId !== courseId))
  }

  return (
    <ScrollView className='favorites page' scrollY>
      {items.length === 0 ? (
        <EmptyState title='暂无收藏' subtitle='收藏感兴趣的课程，方便下次查看' />
      ) : (
        <View className='favorites__grid'>
          {items.map((item) => (
            <View key={item.id} className='favorites__item-wrap'>
              <Text
                className='favorites__remove'
                onClick={() => handleRemove(item.courseId)}
              >
                取消收藏
              </Text>
              <CourseCard course={item.course} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
