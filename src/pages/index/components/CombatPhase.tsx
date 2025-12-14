import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import type { WordData } from '@/data/gameData'

interface CombatPhaseProps {
  wordData: WordData[];
  onComplete: () => void;
  className?: string;
}

interface BubbleItem {
  id: string; // unique id for key
  text: string;
  originalIdx: number;
  top: number;
  left: number;
  delay: number;
  isUsed: boolean;
}

export default function CombatPhase({ wordData, onComplete, className = '' }: CombatPhaseProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userFilled, setUserFilled] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [shake, setShake] = useState(false);
  const [victory, setVictory] = useState(false);
  const [slotsStatus, setSlotsStatus] = useState<'normal' | 'success' | 'error'>('normal');

  const currentWord = wordData[currentLevel];

  // Initialize level
  useEffect(() => {
    if (currentLevel >= wordData.length) {
      onComplete();
      return;
    }
    loadLevel(currentLevel);
  }, [currentLevel]);

  const loadLevel = (levelIndex: number) => {
    const data = wordData[levelIndex];
    setUserFilled([]);
    setSlotsStatus('normal');
    setVictory(false);

    // 1. Get correct syllables
    const correctSyllables = data.syllables.map((text, i) => ({ 
      text, 
      originalIdx: i 
    }));

    // 2. Get distractors
    // Collect all syllables from other words
    const allOtherSyllables = wordData
      .filter((_, idx) => idx !== levelIndex)
      .flatMap(w => w.syllables);
    
    // Shuffle and pick 3 distractors
    const distractors: { text: string; originalIdx: number }[] = [];
    const shuffledPool = allOtherSyllables.sort(() => Math.random() - 0.5);

    for (const syl of shuffledPool) {
      if (distractors.length >= 3) break;
      // Avoid duplicates with correct answer and already picked distractors
      // (Simple check, though in rare cases duplicate distractors are fine)
      if (!data.syllables.includes(syl) && !distractors.some(d => d.text === syl)) {
        distractors.push({
          text: syl,
          originalIdx: -1 // Mark as distractor
        });
      }
    }

    // 3. Merge and generate bubbles with collision avoidance
    const allItems = [...correctSyllables, ...distractors].sort(() => Math.random() - 0.5);
    
    // Simple collision avoidance
    const placedBubbles: {top: number, left: number}[] = [];
    
    const newBubbles = allItems.map((item, i) => {
      let top = 0, left = 0;
      let collision = true;
      let attempts = 0;
      
      while (collision && attempts < 50) {
        top = 5 + Math.random() * 60; // 5% - 65% height
        left = 5 + Math.random() * 65; // 5% - 70% width
        
        // Check collision with existing bubbles (assume ~15% size buffer)
        collision = placedBubbles.some(p => {
          const dist = Math.sqrt(Math.pow(p.top - top, 2) + Math.pow(p.left - left, 2));
          return dist < 18; // Minimum distance threshold in %
        });
        
        attempts++;
      }
      
      placedBubbles.push({ top, left });
      
      return {
        id: `${levelIndex}-${i}-${Math.random()}`,
        text: item.text,
        originalIdx: item.originalIdx,
        top,
        left,
        delay: Math.random() * -5,
        isUsed: false
      };
    });
    
    setBubbles(newBubbles);
  };

  const handleBubbleClick = (bubbleId: string, text: string) => {
    if (userFilled.length >= currentWord.syllables.length || slotsStatus !== 'normal') return;

    // Mark bubble as used
    setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, isUsed: true } : b));
    
    // Add to filled
    const newFilled = [...userFilled, text];
    setUserFilled(newFilled);

    // Check if full
    if (newFilled.length === currentWord.syllables.length) {
      checkAnswer(newFilled);
    }
  };

  const checkAnswer = (filled: string[]) => {
    const isCorrect = filled.join('') === currentWord.syllables.join('');
    
    if (isCorrect) {
      setSlotsStatus('success');
      setVictory(true);
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
      }, 1500);
    } else {
      setSlotsStatus('error');
      setShake(true);
      setTimeout(() => setShake(false), 400);

      // Reset after delay
      setTimeout(() => {
        setUserFilled([]);
        setSlotsStatus('normal');
        setBubbles(prev => prev.map(b => ({ ...b, isUsed: false })));
      }, 600);
    }
  };

  const handleSkip = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setTimeout(() => {
      setCurrentLevel(prev => prev + 1);
    }, 300);
  };

  if (!currentWord) return null;

  return (
    <View className={`combat-phase ${className} ${shake ? 'shake' : ''}`}>
      {victory && (
        <Text className="victory-text victory-anim">{currentWord.word.toUpperCase()}</Text>
      )}

      <View className="combat-header">
        <View className="skip-btn" onClick={handleSkip} hoverClass="hover-scale">SKIP ⏭</View>
      </View>

      {/* Question Hint */}
      <View className="question-hint">
        <Text>{currentWord.cn}</Text>
      </View>

      <View className={`slots-container ${shake ? 'shake' : ''}`}>
        {currentWord.syllables.map((_, i) => {
          const filledText = userFilled[i];
          let statusClass = 'slot-empty';
          if (filledText) {
             statusClass = 'slot-filled';
             if (slotsStatus === 'success') statusClass += ' slot-success';
             if (slotsStatus === 'error') statusClass += ' slot-error';
          }
          
          return (
            <View key={i} className={`slot ${statusClass}`}>
              {filledText}
            </View>
          );
        })}
      </View>

      <View className="bubble-pool">
        {bubbles.map(bubble => (
          <View
            key={bubble.id}
            className={`bubble ${bubble.isUsed ? 'bubble-used' : ''}`}
            style={{
              top: `${bubble.top}%`,
              left: `${bubble.left}%`,
              animationDelay: `${bubble.delay}s`
            }}
            onClick={() => handleBubbleClick(bubble.id, bubble.text)}
          >
            {bubble.text}
          </View>
        ))}
      </View>
    </View>
  );
}
