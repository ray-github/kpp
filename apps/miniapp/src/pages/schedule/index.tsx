import { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import { fetchEnrollments, EnrollmentItem } from '@/services/enrollment'
import { syncTabBarSelected } from '@/utils/tab-bar'
import './index.scss'

export default function SchedulePage() {
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<EnrollmentItem[]>([])

  useDidShow(() => {
    syncTabBarSelected()
    fetchEnrollments().then((res) => {
      setTotal(res.total)
      setItems(res.items)
    })
  })

  return (
    <View className='schedule page page--white'>
      <View className='schedule__status-bar' />

      {/* 顶部 */}
      <View className='schedule__header'>
        <View>
          <Text className='schedule__title'>我的课程</Text>
          <Text className='schedule__count'>共 {total} 门</Text>
        </View>
        <View className='schedule__filter'>
          <Text className='schedule__filter-text'>全部</Text>
          <Text className='schedule__filter-arrow'>▾</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <EmptyState
          title='还没有课程'
          subtitle='快去报名喜欢的课程吧~'
        />
      ) : (
        <ScrollView className='schedule__list' scrollY>
          {items.map((item) => {
            const pct = item.lessonTotal > 0
              ? Math.round((item.lessonUsed / item.lessonTotal) * 100)
              : 0
            return (
              <View key={item.id} className='schedule__item'>
                <View className='schedule__item-bar' />
                <View
                  className='schedule__cover'
                  style={{ background: item.course.coverBg || 'linear-gradient(135deg,#7C3AED,#38BDF8)' }}
                />
                <View className='schedule__info'>
                  <Text className='schedule__course-title'>{item.course.title}</Text>
                  <Text className='schedule__subtitle'>{item.course.subtitle}</Text>
                  <View className='schedule__progress-wrap'>
                    <View className='schedule__progress-bar'>
                      <View
                        className='schedule__progress-fill'
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                    <Text className='schedule__progress-text'>
                      {item.lessonUsed}/{item.lessonTotal} 课时
                    </Text>
                  </View>
                </View>
              </View>
            )
          })}
          <View className='schedule__list-space' />
        </ScrollView>
      )}
    </View>
  )
}
