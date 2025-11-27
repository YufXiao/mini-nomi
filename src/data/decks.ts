export type Card = {
  id: string
  front: string
  back: string
  hint?: string
}

export type Deck = {
  id: string
  name: string
  description?: string
  color: string
  progress: number
  lastReview: string
  cards: Card[]
}

export const decks: Deck[] = [
  {
    id: 'en_vocab',
    name: '英语词汇',
    description: '常见单词',
    color: '#0EA5E9',
    progress: 20,
    lastReview: '2 天前',
    cards: [
      { id: 'c1', front: 'Ephemeral', back: '短暂的', hint: '以 E 开头，短暂' },
      { id: 'c2', front: 'Serendipity', back: '机缘巧合', hint: '意外之喜' },
      { id: 'c3', front: 'Mellifluous', back: '甜美流畅的', hint: '类似 melody' },
      { id: 'c4', front: 'Petrichor', back: '雨后泥土的芬芳', hint: '暴雨之后的味道' }
    ]
  },
  {
    id: 'js_basics',
    name: 'JS基础',
    description: 'JavaScript 核心概念',
    color: '#22C55E',
    progress: 45,
    lastReview: '昨天',
    cards: [
      { id: 'c5', front: 'Closure', back: '函数与其词法作用域的组合', hint: '内层函数引用外层变量' },
      { id: 'c6', front: 'Hoisting', back: '声明提升到作用域顶部', hint: 'var 和函数声明' },
      { id: 'c7', front: 'Promise', back: '表示异步操作的对象', hint: 'pending/fulfilled/rejected' }
    ]
  },
  {
    id: 'geography',
    name: '地理知识',
    description: '世界地理常识',
    color: '#F59E0B',
    progress: 70,
    lastReview: '3 小时前',
    cards: [
      { id: 'c8', front: 'Sahara', back: '世界最大热沙漠', hint: '北非' },
      { id: 'c9', front: 'Nile', back: '非洲最长河流', hint: '埃及' },
      { id: 'c10', front: 'Everest', back: '世界最高峰', hint: '喜马拉雅' }
    ]
  }
]

