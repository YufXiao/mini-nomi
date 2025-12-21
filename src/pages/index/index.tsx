import { View, Button, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import { wordData, type WordData } from '@/data/gameData'
import { getGameState } from '@/utils/gameState'
import HomePhase from './components/HomePhase'
import MemoPhase from './components/MemoPhase'
import CombatPhase from './components/CombatPhase'
import SettlementPhase from './components/SettlementPhase'
import './index.scss'

// Force rebuild
type Phase = 'home' | 'memo' | 'combat' | 'settlement';

export default function Index() {
  const [phase, setPhase] = useState<Phase>('home');
  const [isPaused, setIsPaused] = useState(false);
  const [transitionClass, setTransitionClass] = useState('');
  const [sessionWords, setSessionWords] = useState<WordData[]>([]);
  const [runResults, setRunResults] = useState<{
    success: boolean;
    words: WordData[];
    correctCount: number;
  } | null>(null);
  
  // Biome State
  const [biomeClass, setBiomeClass] = useState('biome-void');

  // Check biome on show
  useDidShow(() => {
    updateBiome();
  });

  const updateBiome = () => {
    const state = getGameState();
    const floor = state.currentFloor;
    
    let biome = 'biome-void';
    if (floor <= 50) biome = 'biome-gateway';
    else if (floor <= 300) biome = 'biome-ruins';
    else if (floor <= 800) biome = 'biome-mines';
    else biome = 'biome-void';
    
    setBiomeClass(biome);
  };

  // Initialize session words when starting game
  const startGame = () => {
    // Pick 5 random words (TODO: Adjust based on gravity/difficulty later)
    const shuffled = [...wordData].sort(() => Math.random() - 0.5);
    setSessionWords(shuffled.slice(0, 5));
    switchPhase('memo');
  };

  // Helper to handle phase transition with animation
  const switchPhase = (nextPhase: Phase) => {
    setTransitionClass('fade-out');
    setTimeout(() => {
      setPhase(nextPhase);
      setTransitionClass('fade-in');
      // Remove fade-in class after animation completes to avoid interference
      setTimeout(() => setTransitionClass(''), 500);
    }, 500);
  };

  const handleCombatComplete = (results: { success: boolean; words: WordData[]; correctCount: number }) => {
    setRunResults(results);
    switchPhase('settlement');
  };

  const handleSettlementContinue = () => {
    updateBiome(); // Update biome before going home in case we ascended
    
    const state = getGameState();
    if (state.currentFloor > 0) {
      // Not yet at surface, continue climbing
      startGame();
    } else {
      // Reached surface
      switchPhase('home');
    }
  };

  const handleExit = () => {
    setIsPaused(false);
    switchPhase('home');
  };

  return (
    <View className={`index-page ${transitionClass} ${biomeClass}`}>
      {/* Background Particles - Customized by Biome in SCSS */}
      <View className="bg-particle p1" />
      <View className="bg-particle p2" />
      <View className="bg-particle p3" />

      {/* Pause Button */}
      {(phase === 'memo' || phase === 'combat') && (
        <View 
          className="pause-btn" 
          onClick={() => setIsPaused(true)}
          hoverClass="hover-scale"
        >
          ⏸
        </View>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <View className="pause-overlay">
          <Text className="pause-title">PAUSED</Text>
          <Button 
            className="menu-btn resume" 
            onClick={() => setIsPaused(false)}
            hoverClass="hover-scale"
          >
            RESUME
          </Button>
          <Button 
            className="menu-btn exit" 
            onClick={handleExit}
            hoverClass="hover-scale"
          >
            EXIT TO CAMP
          </Button>
        </View>
      )}

      {phase === 'home' && (
        <HomePhase 
          onStart={startGame} 
        />
      )}

      {phase === 'memo' && (
        <MemoPhase 
          wordData={sessionWords} 
          onReady={() => switchPhase('combat')} 
          isPaused={isPaused}
        />
      )}

      {phase === 'combat' && (
        <CombatPhase 
          wordData={sessionWords} 
          onComplete={handleCombatComplete} 
          isPaused={isPaused}
        />
      )}

      {phase === 'settlement' && runResults && (
        <SettlementPhase 
          results={runResults}
          onContinue={handleSettlementContinue}
        />
      )}
    </View>
  )
}
