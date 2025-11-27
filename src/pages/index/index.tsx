import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { decks } from '@/data/decks'
import './index.scss'

export default function Index() {
  useLoad(() => {})

  const goDeck = (id: string) => {
    Taro.navigateTo({ url: `/pages/deck/index?id=${id}` })
  }

  return (
    <View className='home'>
      <View className='home-header'>
        <View className='home-title-group'>
          <Text className='home-title'>我的卡组</Text>
        </View>
        <View className='home-actions'>
          <View className='icon-btn' onClick={() => Taro.navigateTo({ url: '/pages/stats/index' })}>
            <Text className='icon-text'>📊</Text>
          </View>
          <View className='icon-btn dark' onClick={() => Taro.navigateTo({ url: '/pages/create/index' })}>
            <Text className='icon-text'>＋</Text>
          </View>
          <View className='icon-btn' onClick={() => Taro.navigateTo({ url: '/pages/settings/index' })}>
            <Text className='icon-text'>⚙</Text>
          </View>
        </View>
      </View>
      <View className='deck-list'>
        {decks.map(d => (
          <View key={d.id} className='deck-item' onClick={() => goDeck(d.id)}>
            <View className='deck-item-inner'>
              <Text className='deck-item-title'>{d.name}</Text>
              <Text className='deck-item-sub'>{d.cards.length} 张 • 上次复习 {d.lastReview}</Text>
              <Text className='deck-item-progress'>{d.progress}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
