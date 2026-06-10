import Taro from '@tarojs/taro'

const STORAGE_KEY = 'kpp_user_location'

export interface LocationInfo {
  label: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export const DEFAULT_LOCATION: LocationInfo = {
  label: '张杨路',
  name: '张杨路',
  address: '上海市浦东新区张杨路',
  latitude: 31.221517,
  longitude: 121.544379,
}

function cleanLocationText(text = '') {
  return text
    .replace(/^中国/, '')
    .replace(/^上海市?/, '')
    .replace(/^\S+?(?:区|县)/, '')
    .replace(/\s+/g, '')
    .trim()
}

function parsePreciseLocationLabel(address: string, name = ''): string {
  const cleanedAddress = cleanLocationText(address)

  const community = cleanedAddress.match(
    /([^,，\s\d号]{2,}(?:小区|公寓|花园|广场|中心|大厦|园|苑|城|府|里|坊|村))/,
  )
  if (community?.[1]) {
    return community[1]
  }

  const road = cleanedAddress.match(/([^,，\s\d号]{2,}(?:大道|中路|东路|西路|南路|北路|路|街|巷|弄))/)
  if (road?.[1]) {
    return road[1]
  }

  const cleanedName = cleanLocationText(name)
  if (cleanedName && !/^(上海|市区|.+区|.+县)$/.test(cleanedName)) {
    return cleanedName
  }

  const district = address.match(/上海市?([^市\s,，]+?(?:区|县))/) || name.match(/(.+?(?:区|县))/)
  if (district?.[1]) {
    return district[1]
  }

  return DEFAULT_LOCATION.label
}

export function loadSavedLocation(): LocationInfo {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw && typeof raw === 'object' && raw.label) {
      const saved = raw as LocationInfo
      return {
        ...saved,
        label: parsePreciseLocationLabel(saved.address || '', saved.name || saved.label),
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCATION
}

export function saveLocation(info: LocationInfo) {
  Taro.setStorageSync(STORAGE_KEY, info)
}

export async function chooseMapLocation(
  fallback: LocationInfo = DEFAULT_LOCATION,
): Promise<LocationInfo> {
  try {
    const picked = await Taro.chooseLocation({
      latitude: fallback.latitude,
      longitude: fallback.longitude,
    })

    const info: LocationInfo = {
      name: picked.name || fallback.name,
      address: picked.address || fallback.address,
      latitude: picked.latitude,
      longitude: picked.longitude,
      label: parsePreciseLocationLabel(picked.address || '', picked.name || ''),
    }

    saveLocation(info)
    return info
  } catch (error) {
    if (error instanceof Error && /cancel/i.test(error.message)) {
      throw new Error('cancel')
    }
    Taro.showToast({ title: '选点失败', icon: 'none' })
    throw error
  }
}
