import { View, Text } from '@tarojs/components'
import { useEffect, useState, useRef } from 'react'
import type { WordData } from '@/data/gameData'
import { getGameState } from '@/utils/gameState'
import './CombatPhase.scss'

interface CombatPhaseProps {
  wordData: WordData[];
  onComplete: (results: { success: boolean; words: WordData[]; correctCount: number }) => void;
  className?: string;
  isPaused?: boolean;
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

export default function CombatPhase({ wordData, onComplete, className = '', isPaused = false }: CombatPhaseProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userFilled, setUserFilled] = useState<{ text: string, bubbleId: string }[]>([]);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [shake, setShake] = useState(false);
  const [victory, setVictory] = useState(false);
  const [slotsStatus, setSlotsStatus] = useState<'normal' | 'success' | 'error'>('normal');
  
  // New State
  const [hp, setHp] = useState(3);
  const [maxHp, setMaxHp] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(1000);

  const currentWord = wordData[currentLevel];

  // Initialize Game State
  useEffect(() => {
    const state = getGameState();
    setHp(state.lantern.fuel);
    setMaxHp(state.lantern.fuel);
    setCurrentFloor(state.currentFloor);
  }, []);

  // Initialize level
  useEffect(() => {
    if (currentLevel >= wordData.length) {
      // Success completion
      onComplete({
        success: true,
        words: wordData,
        correctCount: correctCount
      });
      return;
    }
    loadLevel(currentLevel);
  }, [currentLevel]);

  // Check HP
  useEffect(() => {
    if (hp <= 0) {
      // Failed run
      setTimeout(() => {
        onComplete({
          success: false,
          words: wordData.slice(0, currentLevel + 1), // Processed so far
          correctCount: correctCount
        });
      }, 500);
    }
  }, [hp]);

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
    if (isPaused || userFilled.length >= currentWord.syllables.length || slotsStatus !== 'normal' || hp <= 0) return;

    // Mark bubble as used
    setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, isUsed: true } : b));
    
    // Add to filled
    const newFilled = [...userFilled, { text, bubbleId }];
    setUserFilled(newFilled);

    // Check if full
    if (newFilled.length === currentWord.syllables.length) {
      checkAnswer(newFilled);
    }
  };

  const handleUndo = () => {
    if (isPaused || userFilled.length === 0 || slotsStatus !== 'normal') return;

    const lastItem = userFilled[userFilled.length - 1];
    const newFilled = userFilled.slice(0, -1);
    setUserFilled(newFilled);

    // Return bubble to pool
    setBubbles(prev => prev.map(b => b.id === lastItem.bubbleId ? { ...b, isUsed: false } : b));
  };

  const checkAnswer = (filled: { text: string, bubbleId: string }[]) => {
    const isCorrect = filled.map(f => f.text).join('') === currentWord.syllables.join('');
    
    if (isCorrect) {
      setSlotsStatus('success');
      setVictory(true);
      setCorrectCount(prev => prev + 1);
      
      // Simulate local ascent (visual only)
      setCurrentFloor(prev => Math.max(0, prev - 10));

      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
      }, 1500);
    } else {
      setSlotsStatus('error');
      setShake(true);
      setHp(prev => Math.max(0, prev - 1)); // Deduct HP
      
      setTimeout(() => setShake(false), 400);

      // Reset after delay
      setTimeout(() => {
        if (hp > 1) { // Only reset if not dead (hp check uses old value here, so > 1 means > 0 next render)
            setUserFilled([]);
            setSlotsStatus('normal');
            setBubbles(prev => prev.map(b => ({ ...b, isUsed: false })));
        }
      }, 600);
    }
  };

  const handleSkip = () => {
    if (isPaused) return;
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setTimeout(() => {
      setCurrentLevel(prev => prev + 1);
    }, 300);
  };

  if (!currentWord) return null;

  return (
    <View className={`combat-phase ${className} ${shake ? 'shake' : ''}`}>
      {/* Altimeter Side Bar */}
      <View className="altimeter">
        <View className="ruler" />
        <View className="indicator" style={{ bottom: `${(currentLevel / wordData.length) * 100}%` }}>
            <View className="arrow">◀</View>
            <Text className="floor-label">B{Math.floor(currentFloor)}F</Text>
        </View>
      </View>

      {/* HP Bar */}
      <View className="hp-bar">
          {Array.from({ length: maxHp }).map((_, i) => (
              <View key={i} className={`heart ${i < hp ? 'full' : 'empty'}`} />
          ))}
      </View>

      {victory && (
        <Text 
          className="victory-text victory-anim"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {currentWord.word.toUpperCase()}
        </Text>
      )}

      <View className="combat-header">
        <View className="undo-btn" onClick={handleUndo} hoverClass="hover-scale">⌫</View>
        <View className="skip-btn" onClick={handleSkip} hoverClass="hover-scale">SKIP ⏭</View>
      </View>

      {/* Question Hint */}
      <View className="question-hint">
        <Text>{currentWord.cn}</Text>
        <Text className="difficulty-tag">{currentWord.difficulty}</Text>
      </View>

      <View className={`slots-container ${shake ? 'shake' : ''}`}>
        {currentWord.syllables.map((_, i) => {
          const filledItem = userFilled[i];
          const filledText = filledItem ? filledItem.text : '';
          let statusClass = 'slot-empty';
          if (filledText) {
             statusClass = 'slot-filled';
             if (slotsStatus === 'success') statusClass += ' slot-success';
             if (slotsStatus === 'error') statusClass += ' slot-error';
          }
          
          return (
            <View 
              key={i} 
              className={`slot ${statusClass}`}
              onClick={() => {
                if (filledText && i === userFilled.length - 1) {
                  handleUndo();
                }
              }}
            >
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
              animationDelay: `${bubble.delay}s`,
              animationPlayState: isPaused ? 'paused' : 'running'
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
