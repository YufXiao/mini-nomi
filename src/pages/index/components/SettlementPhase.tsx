import { View, Text, Button } from '@tarojs/components'
import { useEffect, useState } from 'react'
import type { WordData } from '@/data/gameData'
import { getGameState, updateGameState, getDifficultyModifier } from '@/utils/gameState'
import './SettlementPhase.scss'

interface SettlementPhaseProps {
  results: {
    success: boolean;
    words: WordData[];
    correctCount: number;
  };
  onContinue: () => void;
  className?: string;
}

export default function SettlementPhase({ results, onContinue, className = '' }: SettlementPhaseProps) {
  const [animFloor, setAnimFloor] = useState(0);
  const [soulFireGained, setSoulFireGained] = useState(0);
  const [ascensionHeight, setAscensionHeight] = useState(0);
  const [finalFloor, setFinalFloor] = useState(0);

  useEffect(() => {
    const currentState = getGameState();
    let height = 0;
    let fire = 0;

    if (results.success) {
      // Calculate ascension
      // Formula: Sum(Word Base Score * Difficulty Modifier)
      // Assuming Base Score = 10 for now
      height = results.words.reduce((acc, word) => {
        return acc + (10 * getDifficultyModifier(word.difficulty));
      }, 0);
    } else {
      // Fall penalty
      // Fall 10 floors, but respected checkpoints (every 100)
      const current = currentState.currentFloor;
      const nextCheckpoint = Math.ceil(current / 100) * 100;
      const fallTarget = Math.min(current + 10, nextCheckpoint); // Higher number is deeper
      height = -(fallTarget - current); // Negative height for fall
    }

    // Soul Fire is now incrementally saved in CombatPhase
    // We just display what was earned in this run
    fire = results.correctCount;

    setAscensionHeight(height);
    setSoulFireGained(fire);
    setAnimFloor(currentState.currentFloor);
    
    // Target floor (lower number is higher up)
    let targetFloor = currentState.currentFloor - height;
    if (targetFloor < 0) targetFloor = 0; // Cap at surface
    if (targetFloor > 1000) targetFloor = 1000; // Cap at abyss
    
    setFinalFloor(targetFloor);

    // Update Global State (Soul Fire already updated)
    updateGameState({
      currentFloor: targetFloor,
      // Add mastered words logic later
    });

    // Animation
    const animDuration = 2000; // 2s
    const startTime = Date.now();
    
    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / animDuration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      const currentAnimFloor = currentState.currentFloor - (height * ease);
      setAnimFloor(currentAnimFloor);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    
    requestAnimationFrame(tick);

  }, []);

  return (
    <View className={`settlement-phase ${className}`}>
      <View className="title">
        {results.success ? '飞升' : '坠落'}
      </View>

      <View className="stats-container">
        <View className="stat-row">
          <Text className="label">当前深度</Text>
          <Text className="value">地下{Math.floor(animFloor)}层</Text>
        </View>
        
        <View className="stat-row">
          <Text className="label">攀升高度</Text>
          <Text className={`value ${results.success ? 'positive' : 'negative'}`}>
            {results.success ? '▲' : '▼'} {Math.abs(Math.floor(ascensionHeight))}米
          </Text>
        </View>

        <View className="stat-row">
          <Text className="label">灵魂之火</Text>
          <Text className="value">+{soulFireGained} 🔥</Text>
        </View>
      </View>

      <Button className="continue-btn" onClick={onContinue}>继续</Button>
    </View>
  );
}
