import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { getGameState, type GameState } from '@/utils/gameState'
import './HomePhase.scss'

interface HomePhaseProps {
  onStart: () => void;
  className?: string;
}

export default function HomePhase({ onStart, className = '' }: HomePhaseProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useDidShow(() => {
    const state = getGameState();
    setGameState(state);
  });

  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  return (
    <View className={`home-phase ${className}`}>
      {/* Top HUD */}
      <View className="home-header">
        <View className="settings-btn" onClick={handleSettings} hoverClass="hover-scale">
          ⚙️
        </View>
      </View>

      {/* Main Content */}
      <View className="home-content">
        <View className="title-area">
          <Text className="main-title">DUNGEON{'\n'}ASCENSION</Text>
        </View>

        <View className="stats-preview">
          <View className="stat-item">
            <Text className="val soul-text">{gameState ? gameState.soulFire : 0}</Text>
            <Text className="lbl">Soul Fire</Text>
          </View>
        </View>

        <View className="start-btn-container" onClick={onStart} hoverClass="hover-scale-large">
          <View className="outer-ring" />
          <View className="inner-circle">
            <Text className="btn-text">START{'\n'}CLIMB</Text>
            <Text className="btn-sub">Level 1</Text>
          </View>
        </View>
      </View>

      {/* Footer / Camp */}
      {/* <View className="home-footer">
        <Text className="camp-label">Campfire</Text>
      </View> */}
    </View>
  );
}
