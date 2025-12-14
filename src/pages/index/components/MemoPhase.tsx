import { View, Text, Button } from '@tarojs/components'
import { useEffect, useState } from 'react'
import type { WordData } from '@/data/gameData'

interface MemoPhaseProps {
  wordData: WordData[];
  onReady: () => void;
  className?: string;
}

export default function MemoPhase({ wordData, onReady, className = '' }: MemoPhaseProps) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    // Restart animation on mount
    setAnimKey(prev => prev + 1);
    
    // Auto-advance after 15s
    const timer = setTimeout(() => {
      onReady();
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className={`memorization-phase ${className}`}>
      <View className="progress-container">
        <View key={animKey} className="progress-bar anim-countdown" />
      </View>

      <View className="list-container">
        {wordData.map((item, index) => (
          <View 
            key={item.id} 
            className="word-row fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <View className="word-english">
              {item.syllables.map((syl, i) => (
                <Text key={i}>
                  <Text className={`syllable-${(i % 3) + 1}`}>{syl}</Text>
                  {i < item.syllables.length - 1 && <Text>-</Text>}
                </Text>
              ))}
            </View>
            <Text className="word-chinese">{item.cn}</Text>
          </View>
        ))}
      </View>

      <View className="bottom-area">
        <Button className="ghost-btn" onClick={onReady} hoverClass="hover-scale">I'M READY</Button>
      </View>
    </View>
  );
}
