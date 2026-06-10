import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import { FOLLOW_TYPE_LABEL } from '@/constants/user-center'
import { fetchFollows, removeFollow, MockFollowItem } from '@/services/user-center'
import './index.scss'

export default function FollowsPage() {
  const [items, setItems] = useState<MockFollowItem[]>([])

  useDidShow(() => {
    fetchFollows().then(setItems)
  })

  const handleRemove = async (id: string) => {
    const res = await Taro.showModal({ title: '取消关注？' })
    if (!res.confirm) return
    await removeFollow(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
    Taro.showToast({ title: '已取消关注', icon: 'success' })
  }

  return (
    <ScrollView className='follows secondary-page page' scrollY>
      {items.length === 0 ? (
        <EmptyState title='暂无关注' subtitle='关注喜欢的老师或机构' />
      ) : (
        items.map((item) => (
          <View key={item.id} className='secondary-page__card'>
            <View className='secondary-page__row'>
              <View>
                <Text className='secondary-page__title'>{item.targetName}</Text>
                <Text className='secondary-page__desc'>
                  {item.targetDesc || '优质内容创作者'}
                </Text>
                <Text className='secondary-page__tag'>
                  {FOLLOW_TYPE_LABEL[item.targetType] || item.targetType}
                </Text>
              </View>
              <Text
                className='secondary-page__action'
                onClick={() => handleRemove(item.id)}
              >
                取消
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}
