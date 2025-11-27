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
  const s = Taro.getStorageSync('settings') || {}
  return { ...DEFAULT_SETTINGS, ...s }
}

export function setSettings(next: Settings) {
  Taro.setStorageSync('settings', next)
}
