import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { decks } from '@/data/decks'
import './index.scss'

// Helper to generate heatmap data
type HeatmapDay = {
  date: string
  count: number
}

const generateHeatmapData = (totalWeeks: number) => {
  const weeks: HeatmapDay[][] = []
  const today = new Date()
  // Align to the end of the current week (Saturday)
  const dayOfWeek = today.getDay() // 0 (Sun) - 6 (Sat)
  
  // Start date: today minus (totalWeeks * 7) days, plus adjustment to start on Sunday
  // Actually, simpler: just generate 16 weeks ending with the current week
  
  // Let's build weeks from right to left or left to right? Left to right usually.
  // We need the last 16 weeks.
  
  // Calculate the Saturday of the current week
  const currentSaturday = new Date(today)
  currentSaturday.setDate(today.getDate() + (6 - dayOfWeek))
  
  for (let w = 0; w < totalWeeks; w++) {
    const weekData: HeatmapDay[] = []
    const weekSaturday = new Date(currentSaturday)
    weekSaturday.setDate(currentSaturday.getDate() - (totalWeeks - 1 - w) * 7)
    
    // Generate days for this week (Sun to Sat)
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekSaturday)
      day.setDate(weekSaturday.getDate() - (6 - d))
      
      // Mock count: random 0-4
      // Make it slightly realistic: higher chance of 0
      const rand = Math.random()
      let count = 0
      if (rand > 0.7) count = 1
      if (rand > 0.85) count = 2
      if (rand > 0.95) count = 3
      if (rand > 0.98) count = 4
      
      // Don't show future days
      if (day > today) {
        count = -1 // distinct from 0
      }

      weekData.push({
        date: day.toISOString().split('T')[0],
        count
      })
    }
    weeks.push(weekData)
  }
  return weeks
}

export default function StatsPage() {
  const totalDecks = decks.length
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0)
  const avgProgress = Math.round(decks.reduce((acc, d) => acc + d.progress, 0) / Math.max(totalDecks, 1))
  const latestReview = (decks[0] && decks[0].lastReview) || '—'
  const [range, setRange] = useState<'1m' | '3m' | '6m' | '12m'>('3m')
  const RANGE_LABELS: Record<'1m' | '3m' | '6m' | '12m', string> = {
    '1m': '近一个月',
    '3m': '近一季度',
    '6m': '近半年',
    '12m': '近一年'
  }
  const RANGE_WEEKS: Record<'1m' | '3m' | '6m' | '12m', number> = {
    '1m': 5,
    '3m': 13,
    '6m': 26,
    '12m': 52
  }
  
  const heatmapWeeks = generateHeatmapData(RANGE_WEEKS[range])

  useLoad(() => {})

  return (
    <View className='stats-page'>
      <View className='stats-header'>
        <Text className='stats-title'>统计概览</Text>
      </View>

      <View className='stats-grid'>
        <View className='stat-card'>
          <View className='stat-icon orange'>
            <Text className='stat-icon-text'>🔥</Text>
          </View>
          <Text className='stat-label'>连续天数</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>12</Text>
            <Text className='stat-unit'>天</Text>
          </View>
        </View>
        <View className='stat-card'>
          <View className='stat-icon blue'>
            <Text className='stat-icon-text'>📚</Text>
          </View>
          <Text className='stat-label'>卡片总数</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{totalCards}</Text>
          </View>
        </View>
      </View>

      <View className='card heatmap-card'>
        <View className='card-header'>
          <View className='card-header-left'>
            <Text className='card-title'>学习热力图</Text>
          </View>
        </View>

        <View className='heatmap-range'>
          {(['1m','3m','6m','12m'] as const).map(key => (
            <View 
              key={key} 
              className={`range-btn ${range === key ? 'active' : ''}`}
              onClick={() => setRange(key)}
            >
              <Text className='range-btn-text'>{RANGE_LABELS[key]}</Text>
            </View>
          ))}
        </View>
        
        <View className='heatmap-container'>
          <View className='heatmap-weeks'>
            {heatmapWeeks.map((week, wIndex) => (
              <View key={wIndex} className='heatmap-col'>
                {week.map((day, dIndex) => (
                  <View 
                    key={day.date} 
                    className={`heatmap-cell level-${day.count < 0 ? 'empty' : day.count}`} 
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        <View className='heatmap-legend'>
          <Text className='legend-text'>少</Text>
          <View className='legend-items'>
            <View className='heatmap-cell level-0' />
            <View className='heatmap-cell level-1' />
            <View className='heatmap-cell level-2' />
            <View className='heatmap-cell level-3' />
            <View className='heatmap-cell level-4' />
          </View>
          <Text className='legend-text'>多</Text>
        </View>
      </View>

      <View className='card list-card'>
        <View className='list-item'>
          <Text className='list-label'>卡组总数</Text>
          <Text className='list-value'>{totalDecks}</Text>
        </View>
        <View className='divider' />
        <View className='list-item'>
          <Text className='list-label'>平均进度</Text>
          <Text className='list-value'>{avgProgress}%</Text>
        </View>
        <View className='divider' />
        <View className='list-item'>
          <Text className='list-label'>最近复习</Text>
          <Text className='list-value'>{latestReview}</Text>
        </View>
      </View>
    </View>
  )
}
