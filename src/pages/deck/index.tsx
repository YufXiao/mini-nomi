import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getSettings } from '@/utils/settings'
import { decks } from '@/data/decks'
import './index.scss'

export default function DeckPage() {
  const router = useRouter()
  const deckId = (router && router.params && router.params.id) || ''
  const deck = useMemo(() => decks.find(d => d.id === deckId) || decks[0], [deckId])

  useEffect(() => {
    if (deck && deck.name) {
      Taro.setNavigationBarTitle({ title: deck.name })
    }
  }, [deck])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [hasUsedHint, setHasUsedHint] = useState(getSettings().defaultShowHint)
  const [translateX, setTranslateX] = useState(0)
  const [dragOpacity, setDragOpacity] = useState(1)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [entryDir, setEntryDir] = useState<'none' | 'from-right' | 'from-left'>('none')
  const startXRef = useRef(0)
  const hasMovedRef = useRef(false)

  const sys = Taro.getSystemInfoSync()
  const SCREEN_WIDTH = sys.windowWidth
  const SWIPE_THRESHOLD = Math.min(SCREEN_WIDTH * 0.08, 40)

  const currentCard = deck.cards[currentIndex] || deck.cards[0]

  const resetCardState = () => {
    setIsFlipped(false)
    setHasUsedHint(false)
    setTranslateX(0)
    setDragOpacity(1)
    setTransitionEnabled(true)
  }

  const processResultAndNext = (dir: 'next' | 'prev') => {
    if (dir === 'next') {
      if (currentIndex < deck.cards.length - 1) {
        setIsFlipped(false)
        setHasUsedHint(false)
        setEntryDir('from-right')
        setCurrentIndex(prev => prev + 1)
      } else {
        setIsFinished(true)
      }
    } else {
      if (currentIndex > 0) {
        setIsFlipped(false)
        setHasUsedHint(false)
        setEntryDir('from-left')
        setCurrentIndex(prev => Math.max(prev - 1, 0))
      } else {
        try { Taro.showToast({ title: '已是第一张', icon: 'none' }) } catch (e) {}
      }
    }
  }

  const handleRate = (isForgot: boolean) => {
    setTransitionEnabled(true)
    setTranslateX(-SCREEN_WIDTH * 1.5)
    setDragOpacity(0)
    triggerHaptic()
    setTimeout(() => {
      processResultAndNext('next')
    }, 300)
  }

  const onTouchStart = (e) => {
    const t = e && e.touches && e.touches[0]
    startXRef.current = (t && t.pageX) || 0
    setTransitionEnabled(false)
    hasMovedRef.current = false
  }

  const onTouchMove = (e) => {
    const t = e && e.touches && e.touches[0]
    const x = (t && t.pageX) || 0
    const deltaX = x - startXRef.current
    setTranslateX(deltaX)
    const op = 1 - Math.min(Math.abs(deltaX) / (SCREEN_WIDTH * 0.8), 1)
    setDragOpacity(op)
    if (Math.abs(deltaX) > 3) {
      hasMovedRef.current = true
    }
  }

  const onTouchEnd = (e) => {
    const s = getSettings()
    if (!s.swipeNext) return
    const ct = e && e.changedTouches && e.changedTouches[0]
    const endX = (ct && ct.pageX) || 0
    const deltaX = endX - startXRef.current
    if (deltaX < -SWIPE_THRESHOLD) {
      setTransitionEnabled(true)
      setTranslateX(-SCREEN_WIDTH * 1.5)
      setDragOpacity(0)
      setTimeout(() => {
        triggerHaptic()
        processResultAndNext('next')
      }, 300)
    } else if (deltaX > SWIPE_THRESHOLD) {
      if (currentIndex > 0) {
        setTransitionEnabled(true)
        setTranslateX(SCREEN_WIDTH * 1.5)
        setDragOpacity(0)
        setTimeout(() => {
          triggerHaptic()
          processResultAndNext('prev')
        }, 300)
      } else {
        try { Taro.showToast({ title: '已是第一张', icon: 'none' }) } catch (e) {}
        setTransitionEnabled(true)
        setTranslateX(0)
        setDragOpacity(1)
      }
    } else {
      setTransitionEnabled(true)
      setTranslateX(0)
      setDragOpacity(1)
    }
  }

  useEffect(() => {
    if (entryDir === 'none') return
    setTransitionEnabled(false)
    setTranslateX(entryDir === 'from-right' ? SCREEN_WIDTH * 1.1 : -SCREEN_WIDTH * 1.1)
    setDragOpacity(0)
    const t = setTimeout(() => {
      setTransitionEnabled(true)
      setTranslateX(0)
      setDragOpacity(1)
      setEntryDir('none')
    }, 16)
    return () => clearTimeout(t)
  }, [currentIndex, entryDir])

  if (isFinished) {
    return (
      <View className='study-finish'>
        <Text className='finish-emoji'>🎉</Text>
        <Text className='finish-title'>学习完成</Text>
        <Text className='finish-sub'>本次牌组已掌握</Text>
        <View className='finish-btn' onClick={() => Taro.navigateBack()}>
          <Text className='finish-btn-text'>返回</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='study-page'>
      <View className='study-header'>
        <Text className='header-sub'>Flashcard Set</Text>
        <View className='header-row'>
          <Text className='header-count'>
            {currentIndex + 1}
            <Text className='header-total'> / {deck.cards.length}</Text>
          </Text>
          <Text className='header-tip'>左右滑动切换</Text>
        </View>
      </View>

      <View className='card-wrapper' style={{ marginBottom: '8vh' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={() => { if (hasMovedRef.current) { hasMovedRef.current = false; return } triggerHaptic(); setIsFlipped(prev => !prev) }}>
        <View className={`card-outer ${isFlipped ? 'is-flipped' : ''}`} style={{ transform: `translateX(${translateX}px)`, transition: transitionEnabled ? 'transform 0.3s ease, opacity 0.2s ease' : 'none', opacity: dragOpacity }}>
          <View className='card-inner'>
            <View className='card-face front'>
              <Text className='label'>Question</Text>
              <Text className='front-text'>{currentCard.front}</Text>
              {currentCard.hint ? (
                <View className='hint-row'>
                  {hasUsedHint ? (
                    <Text className='hint-text'>{currentCard.hint}</Text>
                  ) : (
                    <View className='hint-btn' onClick={(e) => { e.stopPropagation(); setHasUsedHint(true) }}>
                      <Text>💡</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
            <View className='card-face back'>
              <Text className='label dark'>Answer</Text>
              <Text className='back-text'>{currentCard.back}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='controls'>
        {isFlipped ? (
          <View className='controls-row'>
            <View className='btn btn-forgot' onClick={() => handleRate(true)}>
              <Text className='btn-text'>忘了</Text>
            </View>
            <View className='btn btn-got' onClick={() => handleRate(false)}>
              <Text className='btn-text'>记住了</Text>
            </View>
          </View>
        ) : (
          <View className='hint-footer'>
            <Text className='hint-footer-text'></Text>
          </View>
        )}
      </View>
    </View>
  )
}
  const triggerHaptic = () => {
    const s = getSettings()
    if (s.haptic) {
      try { Taro.vibrateShort() } catch (e) {}
    }
  }
