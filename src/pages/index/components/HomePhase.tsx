import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect, useCallback } from 'react'
import { getGameState, type GameState } from '@/utils/gameState'
import './HomePhase.scss'

interface HomePhaseProps {
  onStart: () => void;
  className?: string;
}

export default function HomePhase({ onStart, className = '' }: HomePhaseProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const refreshState = useCallback(() => {
    const state = getGameState();
    setGameState(state);
  }, []);

  // Refresh on mount (when switching phases back to home)
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Refresh on page show (when returning from Settings/other pages)
  useDidShow(() => {
    refreshState();
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
        <Text className="main-title">地牢飞升</Text>
      </View>

      <View className="stats-preview">
        <View className="stat-item">
          <Text className="val soul-text">{gameState ? gameState.soulFire : 0}</Text>
          <Text className="lbl">魂火</Text>
        </View>
      </View>

      <View className="start-btn-container" onClick={onStart} hoverClass="hover-scale-large">
        <View className="outer-ring" />
        <View className="inner-circle">
          <Text className="btn-text">开始{'\n'}攀登</Text>
          <Text className="btn-sub">第 1 层</Text>
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
