import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { MERCHANT_STATUS_LABEL } from '@/constants/user-center'
import {
  fetchMerchantApplication,
  submitMerchantApplication,
} from '@/services/user-center'
import { MockMerchantApplication } from '@/mock/storage'
import './index.scss'

export default function MerchantApplyPage() {
  const router = useRouter()
  const type = router.params.type === 'personal' ? 'PERSONAL' : 'INSTITUTION'
  const typeLabel = type === 'PERSONAL' ? '个人入驻' : '机构入驻'

  const [application, setApplication] = useState<MockMerchantApplication | null>(null)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('上海')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useDidShow(() => {
    Taro.setNavigationBarTitle({ title: typeLabel })
    fetchMerchantApplication().then(setApplication)
  })

  const handleSubmit = async () => {
    if (!name || !contact || !phone) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const result = await submitMerchantApplication({
        type,
        name,
        contact,
        phone,
        city,
        description,
      })
      setApplication({
        id: result.id,
        type,
        name,
        contact,
        phone,
        city,
        description,
        status: result.status,
        createdAt: new Date().toISOString(),
      })
      Taro.showToast({ title: '提交成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : '提交失败',
        icon: 'none',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (application?.status === 'PENDING') {
    return (
      <View className='merchant-apply form-page page'>
        <View className='secondary-page__card merchant-apply__status'>
          <Text className='merchant-apply__status-text'>
            {MERCHANT_STATUS_LABEL[application.status]} · {typeLabel}
          </Text>
          <Text className='secondary-page__desc' style={{ marginTop: 12 }}>
            名称：{application.name}
          </Text>
          <Text className='secondary-page__desc'>
            联系人：{application.contact} · {application.phone}
          </Text>
          <Text className='secondary-page__desc'>
            预计 1-3 个工作日完成审核
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className='merchant-apply form-page page'>
      <View className='form-page__group'>
        <Text className='form-page__label'>{type === 'PERSONAL' ? '姓名' : '机构名称'} *</Text>
        <Input className='form-page__input' value={name} onInput={(e) => setName(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>联系人 *</Text>
        <Input className='form-page__input' value={contact} onInput={(e) => setContact(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>联系电话 *</Text>
        <Input className='form-page__input' type='number' value={phone} onInput={(e) => setPhone(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>所在城市</Text>
        <Input className='form-page__input' value={city} onInput={(e) => setCity(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>简介说明</Text>
        <Input
          className='form-page__textarea'
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
        />
      </View>

      <View className='form-page__footer'>
        <Button type='primary' block loading={submitting} onClick={handleSubmit}>
          提交入驻申请
        </Button>
      </View>
    </View>
  )
}
