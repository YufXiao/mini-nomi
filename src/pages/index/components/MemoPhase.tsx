import { View, Text, Button } from '@tarojs/components'
import { useEffect, useState, useRef } from 'react'
import type { WordData } from '@/data/gameData'
import { getGameState } from '@/utils/gameState'
import './MemoPhase.scss'

interface MemoPhaseProps {
  wordData: WordData[];
  onReady: () => void;
  className?: string;
  isPaused?: boolean;
}

export default function MemoPhase({ wordData, onReady, className = '', isPaused = false }: MemoPhaseProps) {
  const [animKey, setAnimKey] = useState(0);
  const [duration, setDuration] = useState(15000);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(15000);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Get brightness from lantern
    const state = getGameState();
    const brightness = state.lantern.brightness;
    const extraTime = (brightness - 1) * 2000; // +2s per level
    const totalTime = 15000 + extraTime;
    setDuration(totalTime);
    setTimeLeft(totalTime);
    
    // Restart animation on mount
    setAnimKey(prev => prev + 1);
    isMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (isPaused) {
      // Pause: Calculate remaining time
      if (timerRef.current) clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      setTimeLeft(prev => Math.max(0, prev - elapsed));
    } else {
      // Resume: Start timer with remaining time
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onReady();
      }, timeLeft);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused]); // Remove other deps to avoid reset loops

  return (
    <View className={`memorization-phase ${className}`}>
      <View className="progress-container">
        <View 
          key={animKey} 
          className="progress-bar anim-countdown" 
          style={{ 
            animationDuration: `${duration}ms`,
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        />
      </View>

      <View className="list-container">
        {wordData.map((item, index) => (
          <View 
            key={item.id} 
            className="word-row fade-in"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            <View className="word-english">
              {item.syllables.map((syl, i) => (
                <Text key={i}>
                  <Text className={`syllable-${(i % 3) + 1}`}>{syl}</Text>
                  {i < item.syllables.length - 1 && <Text>-</Text>}
                </Text>
              ))}
            </View>
            <View className="word-meta">
              <Text className="word-chinese">{item.cn}</Text>
              <Text className={`difficulty-badge ${item.difficulty.toLowerCase()}`}>
                {item.difficulty}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="bottom-area">
        <Button className="ghost-btn" onClick={onReady} hoverClass="hover-scale">I'M READY</Button>
      </View>
    </View>
  );
}
