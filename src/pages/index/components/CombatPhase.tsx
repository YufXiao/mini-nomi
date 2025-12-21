import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState, useRef } from 'react'
import type { WordData } from '@/data/gameData'
import { getGameState, updateGameState } from '@/utils/gameState'
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

interface FlyingBubble {
  id: string;
  text: string;
  top: number;
  left: number;
}

export default function CombatPhase({ wordData, onComplete, className = '', isPaused = false }: CombatPhaseProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userFilled, setUserFilled] = useState<{ text: string, bubbleId: string, isAnimating?: boolean }[]>([]);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [flyingBubbles, setFlyingBubbles] = useState<FlyingBubble[]>([]);
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

  // Watch userFilled for completion
  useEffect(() => {
    if (currentWord && userFilled.length === currentWord.syllables.length) {
      const anyAnimating = userFilled.some(f => f.isAnimating);
      if (!anyAnimating) {
        checkAnswer(userFilled);
      }
    }
  }, [userFilled]);

  const loadLevel = (levelIndex: number) => {
    const data = wordData[levelIndex];
    setUserFilled([]);
    setSlotsStatus('normal');
    setVictory(false);
    setFlyingBubbles([]);

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

    // Determine target slot
    const targetSlotIndex = userFilled.length;

    // Get positions
    const query = Taro.createSelectorQuery();
    const safeBubbleId = bubbleId.replace(/\./g, '-');
    query.select(`#bubble-${safeBubbleId}`).boundingClientRect();
    query.select(`#slot-${targetSlotIndex}`).boundingClientRect();
    
    query.exec((res) => {
      const bubbleRect = res[0];
      const slotRect = res[1];

      // Fallback if measurement fails
      if (!bubbleRect || !slotRect) {
        setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, isUsed: true } : b));
        setUserFilled([...userFilled, { text, bubbleId }]);
        return;
      }

      const flyId = `fly-${Date.now()}`;

      // 1. Mark bubble as used
      setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, isUsed: true } : b));
      
      // 2. Add to filled with animating flag
      setUserFilled(prev => [...prev, { text, bubbleId, isAnimating: true }]);

      // 3. Create flying bubble at start pos
      setFlyingBubbles(prev => [...prev, {
        id: flyId,
        text,
        top: bubbleRect.top,
        left: bubbleRect.left
      }]);

      // 4. Trigger move to target
      setTimeout(() => {
        setFlyingBubbles(prev => prev.map(b => {
          if (b.id === flyId) {
            return { ...b, top: slotRect.top, left: slotRect.left };
          }
          return b;
        }));
      }, 50);

      // 5. Cleanup
      setTimeout(() => {
        setFlyingBubbles(prev => prev.filter(b => b.id !== flyId));
        setUserFilled(prev => prev.map(item => {
          if (item.bubbleId === bubbleId) {
            return { ...item, isAnimating: false };
          }
          return item;
        }));
      }, 550);
    });
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

      // Incrementally save Soul Fire
      const currentState = getGameState();
      updateGameState({ soulFire: currentState.soulFire + 1 });

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

  if (!currentWord) return null;

  const difficultyMap: Record<string, string> = {
    'Easy': '简单',
    'Medium': '中等',
    'Hard': '困难'
  };

  return (
    <View className={`combat-phase ${className} ${shake ? 'shake' : ''}`}>
      {/* Altimeter Side Bar */}
      <View className="altimeter">
        <Text className="progress-text">{Math.round(((1000 - currentFloor) / 1000) * 100)}%</Text>
        <View className="progress-track">
            <View 
                className="progress-fill" 
                style={{ height: `${((1000 - currentFloor) / 1000) * 100}%` }} 
            />
        </View>
      </View>

      {victory && (
        <Text 
          className="victory-text victory-anim"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {currentWord.word}
        </Text>
      )}

      <View className="combat-header">
        {/* HP Bar */}
        <View className="hp-bar">
            {Array.from({ length: maxHp }).map((_, i) => (
                <View key={i} className={`heart ${i < hp ? 'full' : 'empty'}`} />
            ))}
        </View>
      </View>

      <View className="undo-btn" onClick={handleUndo} hoverClass="hover-scale">↩</View>

      {/* Question Hint */}
      <View className="question-hint">
        <Text>{currentWord.cn}</Text>
        <Text className="difficulty-tag">{difficultyMap[currentWord.difficulty] || currentWord.difficulty}</Text>
      </View>

      <View className={`slots-container ${shake ? 'shake' : ''}`}>
        {currentWord.syllables.map((_, i) => {
          const filledItem = userFilled[i];
          const filledText = filledItem ? filledItem.text : '';
          const isAnimating = filledItem && filledItem.isAnimating;
          
          let statusClass = 'slot-empty';
          if (filledText) {
             statusClass = 'slot-filled';
             if (slotsStatus === 'success') statusClass += ' slot-success';
             if (slotsStatus === 'error') statusClass += ' slot-error';
          }
          
          return (
            <View 
              key={i}
              id={`slot-${i}`}
              className={`slot ${statusClass}`}
              onClick={() => {
                if (filledText && i === userFilled.length - 1) {
                  handleUndo();
                }
              }}
            >
              {!isAnimating && filledText}
            </View>
          );
        })}
      </View>

      <View className="bubble-pool">
        {bubbles.map(bubble => (
          <View
            key={bubble.id}
            id={`bubble-${bubble.id.replace(/\./g, '-')}`}
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
      
      {/* Flying Bubbles */}
      {flyingBubbles.map(fb => (
        <View
          key={fb.id}
          className="flying-bubble"
          style={{
            top: `${fb.top}px`,
            left: `${fb.left}px`
          }}
        >
          {fb.text}
        </View>
      ))}
    </View>
  );
}
