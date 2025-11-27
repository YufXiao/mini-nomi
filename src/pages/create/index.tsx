import { useState } from 'react'
import { View, Text, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { decks, type Deck, type Card } from '@/data/decks'
import './index.scss'

export default function CreatePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#0EA5E9')
  const [rawCards, setRawCards] = useState('front | back | hint')

  const presetColors = ['#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

  const parseCards = (raw: string): Card[] => {
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const result: Card[] = []
    let idx = 1
    for (const line of lines) {
      const parts = line.split('|').map(s => s.trim())
      const [front, back, hint] = [parts[0], parts[1], parts[2]]
      if (front && back) {
        result.push({ id: `n${idx++}`, front, back, hint })
      }
    }
    if (result.length === 0) {
      result.push({ id: 'n1', front: '示例题目', back: '示例答案' })
    }
    return result
  }

  const submit = () => {
    const id = `d_${Date.now()}`
    const newDeck: Deck = {
      id,
      name: name || '未命名卡组',
      description,
      color,
      progress: 0,
      lastReview: '刚刚',
      cards: parseCards(rawCards)
    }
    decks.push(newDeck)
    Taro.showToast({ title: '已创建', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 500)
  }

  return (
    <View className='create-page'>
      <View className='form-row'>
        <Text className='label'>名称</Text>
        <Input className='input' value={name} onInput={e => setName((e.detail as any).value)} placeholder='例如：英语词汇' />
      </View>
      <View className='form-row'>
        <Text className='label'>描述</Text>
        <Input className='input' value={description} onInput={e => setDescription((e.detail as any).value)} placeholder='可选' />
      </View>
      <View className='form-row'>
        <Text className='label'>颜色</Text>
        <Input className='input' value={color} onInput={e => setColor((e.detail as any).value)} placeholder='#0EA5E9' />
        <View className='color-row'>
          {presetColors.map(c => (
            <View key={c} className='color-chip' style={{ backgroundColor: c }} onClick={() => setColor(c)} />
          ))}
        </View>
      </View>
      <View className='form-row'>
        <Text className='label'>卡片（每行格式：front | back | hint）</Text>
        <Textarea className='textarea' value={rawCards} onInput={e => setRawCards((e.detail as any).value)} placeholder={'front | back | hint\nfront2 | back2'} />
      </View>
      <View className='submit-btn' onClick={submit}>
        <Text className='submit-text'>创建</Text>
      </View>
    </View>
  )
}
