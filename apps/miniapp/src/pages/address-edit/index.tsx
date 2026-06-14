import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, Input, Switch } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { fetchAddresses, saveAddress } from '@/services/user-center'
import './index.scss'

export default function AddressEditPage() {
  const router = useRouter()
  const editId = router.params.id

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('广东省')
  const [city, setCity] = useState('深圳市')
  const [district, setDistrict] = useState('南山区')
  const [detail, setDetail] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useDidShow(async () => {
    if (!editId) return
    const items = await fetchAddresses()
    const item = items.find((a) => a.id === editId)
    if (!item) return
    setName(item.name)
    setPhone(item.phone)
    setProvince(item.province)
    setCity(item.city)
    setDistrict(item.district)
    setDetail(item.detail)
    setIsDefault(item.isDefault)
  })

  const handleSave = async () => {
    if (!name || !phone || !detail) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    setSaving(true)
    try {
      await saveAddress({
        id: editId,
        name,
        phone,
        province,
        city,
        district,
        detail,
        isDefault,
      })
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className='address-edit form-page page'>
      <View className='form-page__group'>
        <Text className='form-page__label'>收货人 *</Text>
        <Input className='form-page__input' value={name} onInput={(e) => setName(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>手机号 *</Text>
        <Input className='form-page__input' type='number' value={phone} onInput={(e) => setPhone(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>省市区</Text>
        <Input className='form-page__input' value={province} onInput={(e) => setProvince(e.detail.value)} placeholder='省份' />
        <Input className='form-page__input' style={{ marginTop: 12 }} value={city} onInput={(e) => setCity(e.detail.value)} placeholder='城市' />
        <Input className='form-page__input' style={{ marginTop: 12 }} value={district} onInput={(e) => setDistrict(e.detail.value)} placeholder='区县' />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>详细地址 *</Text>
        <Input className='form-page__textarea' value={detail} onInput={(e) => setDetail(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <View className='form-page__switch-row'>
          <Text className='form-page__switch-label'>设为默认地址</Text>
          <Switch checked={isDefault} onChange={(e) => setIsDefault(e.detail.value)} color='#6366F1' />
        </View>
      </View>

      <View className='form-page__footer'>
        <Button type='primary' block loading={saving} onClick={handleSave}>
          保存
        </Button>
      </View>
    </View>
  )
}
