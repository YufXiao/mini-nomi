import { View } from '@tarojs/components'
import { useState } from 'react'
import { wordData } from '@/data/gameData'
import HomePhase from './components/HomePhase'
import MemoPhase from './components/MemoPhase'
import CombatPhase from './components/CombatPhase'
import './index.scss'

// Force rebuild
type Phase = 'home' | 'memo' | 'combat';

export default function Index() {
  const [phase, setPhase] = useState<Phase>('home');
  const [transitionClass, setTransitionClass] = useState('');
  const [sessionWords, setSessionWords] = useState<typeof wordData>([]);

  // Initialize session words when starting game
  const startGame = () => {
    // Pick 5 random words
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

  return (
    <View className={`index-page ${transitionClass}`}>
      {/* Background Particles */}
      <View className="bg-particle" style={{ width: '600rpx', height: '600rpx', top: '-100rpx', left: '-100rpx', animationDelay: '0s' }} />
      <View className="bg-particle" style={{ width: '500rpx', height: '500rpx', bottom: '100rpx', right: '-100rpx', animationDelay: '-10s' }} />

      {phase === 'home' && (
        <HomePhase 
          onStart={startGame} 
        />
      )}

      {phase === 'memo' && (
        <MemoPhase 
          wordData={sessionWords} 
          onReady={() => switchPhase('combat')} 
        />
      )}

      {phase === 'combat' && (
        <CombatPhase 
          wordData={sessionWords} 
          onComplete={() => {
            // Show completion alert or logic
            // For now just return home
            switchPhase('home');
          }} 
        />
      )}
    </View>
  )
}
