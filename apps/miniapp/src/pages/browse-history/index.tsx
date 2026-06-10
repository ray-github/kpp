import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import {
  clearBrowseHistory,
  fetchBrowseHistory,
  MockHistoryItem,
} from '@/services/user-center'
import './index.scss'

export default function BrowseHistoryPage() {
  const [items, setItems] = useState<MockHistoryItem[]>([])

  const load = () => fetchBrowseHistory().then(setItems)

  useDidShow(() => {
    load()
  })

  const handleClear = async () => {
    const res = await Taro.showModal({ title: '清空浏览历史？' })
    if (!res.confirm) return
    await clearBrowseHistory()
    setItems([])
    Taro.showToast({ title: '已清空', icon: 'success' })
  }

  const goDetail = (courseId: string) => {
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${courseId}` })
  }

  return (
    <ScrollView className='browse-history secondary-page page' scrollY>
      {items.length > 0 && (
        <View className='secondary-page__toolbar'>
          <Text className='secondary-page__link' onClick={handleClear}>
            清空
          </Text>
        </View>
      )}

      {items.length === 0 ? (
        <EmptyState title='暂无浏览记录' subtitle='去看看感兴趣的课程吧' />
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            className='secondary-page__card'
            onClick={() => goDetail(item.courseId)}
          >
            <Text className='secondary-page__title'>{item.course.title}</Text>
            <Text className='secondary-page__desc'>{item.course.subtitle}</Text>
            <Text className='browse-history__time'>
              {new Date(item.viewedAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}
