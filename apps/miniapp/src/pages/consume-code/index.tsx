import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import { fetchConsumeCodes, fetchConsumeCode } from '@/services/consume'
import { useUserStore } from '@/stores/user'
import './index.scss'

interface ConsumeCodeItem {
  enrollmentId: string
  courseTitle: string
  remainingLessons: number
  code: string
}

export default function ConsumeCodePage() {
  const ensureLogin = useUserStore((s) => s.ensureLogin)
  const [codes, setCodes] = useState<ConsumeCodeItem[]>([])
  const [active, setActive] = useState<ConsumeCodeItem | null>(null)

  const loadCodes = async () => {
    await ensureLogin()
    const list = await fetchConsumeCodes()
    setCodes(list)
    if (list.length > 0) {
      const detail = await fetchConsumeCode(list[0].enrollmentId)
      setActive({
        enrollmentId: detail.enrollmentId,
        courseTitle: detail.courseTitle,
        remainingLessons: detail.remainingLessons,
        code: detail.code,
      })
    } else {
      setActive(null)
    }
  }

  useDidShow(() => {
    loadCodes()
  })

  const selectCourse = async (item: ConsumeCodeItem) => {
    const detail = await fetchConsumeCode(item.enrollmentId)
    setActive({
      enrollmentId: detail.enrollmentId,
      courseTitle: detail.courseTitle,
      remainingLessons: detail.remainingLessons,
      code: detail.code,
    })
  }

  const refreshCode = async () => {
    if (!active) return
    await selectCourse(active)
    Taro.showToast({ title: '已刷新', icon: 'none' })
  }

  if (codes.length === 0) {
    return (
      <View className='consume-code consume-code--empty page'>
        <EmptyState
          compact
          title='暂无可用课消码'
          subtitle='购买课程后可在此出示核销'
          actionText='去逛逛'
          onAction={() => Taro.switchTab({ url: '/pages/home/index' })}
        />
      </View>
    )
  }

  return (
    <View className='consume-code page'>
      <ScrollView className='consume-code__courses' scrollX>
        {codes.map((item) => (
          <View
            key={item.enrollmentId}
            className={`consume-code__course ${
              active?.enrollmentId === item.enrollmentId ? 'consume-code__course--active' : ''
            }`}
            onClick={() => selectCourse(item)}
          >
            <Text className='consume-code__course-title'>{item.courseTitle}</Text>
            <Text className='consume-code__course-sub'>剩余 {item.remainingLessons} 课时</Text>
          </View>
        ))}
      </ScrollView>

      {active && (
        <View className='consume-code__panel'>
          <Text className='consume-code__title'>{active.courseTitle}</Text>
          <Text className='consume-code__hint'>向机构出示以下课消码完成核销</Text>
          <View className='consume-code__qr-wrap'>
            <View className='consume-code__qr-placeholder'>
              <Text className='consume-code__qr-icon'>▦</Text>
            </View>
          </View>
          <Text className='consume-code__code'>{active.code}</Text>
          <Text className='consume-code__refresh' onClick={refreshCode}>
            点击刷新码
          </Text>
        </View>
      )}
    </View>
  )
}
