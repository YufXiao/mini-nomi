import Taro from '@tarojs/taro'

export type Settings = {
  haptic: boolean
  swipeNext: boolean
  defaultShowHint: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  haptic: true,
  swipeNext: true,
  defaultShowHint: false
}

export function getSettings(): Settings {
  try {
    const s = Taro.getStorageSync('settings') || {}
    return { ...DEFAULT_SETTINGS, ...s }
  } catch (e) {
    console.error('Failed to get settings', e)
    return DEFAULT_SETTINGS
  }
}

export function setSettings(next: Settings) {
  try {
    Taro.setStorageSync('settings', next)
  } catch (e) {
    console.error('Failed to set settings', e)
  }
}
