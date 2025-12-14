import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface HomePhaseProps {
  onStart: () => void;
  className?: string;
}

export default function HomePhase({ onStart, className = '' }: HomePhaseProps) {
  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  return (
    <View className={`home-phase ${className}`}>
      <View className="settings-btn" onClick={handleSettings} hoverClass="hover-scale">⚙️</View>
      <View className="game-title">
        <Text>MEMORY</Text>
        <View />
        <Text>DUNGEON</Text>
      </View>
      <View className="main-start-btn" onClick={onStart} hoverClass="hover-scale">
        <Text>START{'\n'}RUN</Text>
      </View>
    </View>
  );
}
