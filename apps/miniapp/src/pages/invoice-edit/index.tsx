import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, Input, Switch } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { fetchInvoices, saveInvoice } from '@/services/user-center'
import './index.scss'

export default function InvoiceEditPage() {
  const router = useRouter()
  const editId = router.params.id

  const [title, setTitle] = useState('')
  const [taxNo, setTaxNo] = useState('')
  const [email, setEmail] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useDidShow(async () => {
    if (!editId) return
    const items = await fetchInvoices()
    const item = items.find((a) => a.id === editId)
    if (!item) return
    setTitle(item.title)
    setTaxNo(item.taxNo || '')
    setEmail(item.email || '')
    setIsDefault(item.isDefault)
  })

  const handleSave = async () => {
    if (!title) {
      Taro.showToast({ title: '请填写发票抬头', icon: 'none' })
      return
    }
    setSaving(true)
    try {
      await saveInvoice({ id: editId, title, taxNo, email, isDefault })
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className='invoice-edit form-page page'>
      <View className='form-page__group'>
        <Text className='form-page__label'>发票抬头 *</Text>
        <Input className='form-page__input' value={title} onInput={(e) => setTitle(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>税号（企业选填）</Text>
        <Input className='form-page__input' value={taxNo} onInput={(e) => setTaxNo(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <Text className='form-page__label'>接收邮箱</Text>
        <Input className='form-page__input' value={email} onInput={(e) => setEmail(e.detail.value)} />
      </View>
      <View className='form-page__group'>
        <View className='form-page__switch-row'>
          <Text className='form-page__switch-label'>设为默认</Text>
          <Switch checked={isDefault} onChange={(e) => setIsDefault(e.detail.value)} color='#66ccff' />
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
