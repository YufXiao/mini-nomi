import { useEffect, useState } from 'react'
import { View, Text, Switch } from '@tarojs/components'
import { getSettings, setSettings } from '@/utils/settings'
import type { Settings } from '@/utils/settings'
import './index.scss'

export default function SettingsPage() {
  const [settings, setLocal] = useState<Settings>(getSettings())

  useEffect(() => {
    setLocal(getSettings())
  }, [])

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setLocal(next)
    setSettings(next)
  }

  return (
    <View className='settings-page'>
      <View className='item'>
        <Text className='label'>震动反馈</Text>
        <Switch checked={settings.haptic} onChange={e => update({ haptic: (e.detail as any).value })} />
      </View>
      <View className='item'>
        <Text className='label'>左滑下一张</Text>
        <Switch checked={settings.swipeNext} onChange={e => update({ swipeNext: (e.detail as any).value })} />
      </View>
      <View className='item'>
        <Text className='label'>默认显示提示</Text>
        <Switch checked={settings.defaultShowHint} onChange={e => update({ defaultShowHint: (e.detail as any).value })} />
      </View>
    </View>
  )
}
