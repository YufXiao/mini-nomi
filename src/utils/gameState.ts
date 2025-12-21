import Taro from '@tarojs/taro';

export interface LanternStats {
  brightness: number; // Increases memo time
  fuel: number;       // HP max
  flare: number;      // Active skill level (not implemented yet)
  anchor: number;     // Reduces fall penalty
}

export interface GameState {
  currentFloor: number; // B1000F -> 0F
  soulFire: number;
  lantern: LanternStats;
  masteredWords: number[]; // IDs of mastered words
  lastLogin: number;
  consecutiveLogins: number;
}

const DEFAULT_STATE: GameState = {
  currentFloor: 1000, // Starts at B1000F
  soulFire: 0,
  lantern: {
    brightness: 1,
    fuel: 3,
    flare: 0,
    anchor: 0
  },
  masteredWords: [],
  lastLogin: Date.now(),
  consecutiveLogins: 1
};

const STORAGE_KEY = 'dungeon_ascension_save';

export const getGameState = (): GameState => {
  const saved = Taro.getStorageSync(STORAGE_KEY);
  if (saved) {
    return { ...DEFAULT_STATE, ...saved };
  }
  return DEFAULT_STATE;
};

export const saveGameState = (state: GameState) => {
  Taro.setStorageSync(STORAGE_KEY, state);
};

export const updateGameState = (updates: Partial<GameState>) => {
  const current = getGameState();
  const newState = { ...current, ...updates };
  saveGameState(newState);
  return newState;
};

export const resetGameState = () => {
  Taro.removeStorageSync(STORAGE_KEY);
  return DEFAULT_STATE;
};

// Helper to calculate difficulty modifier
export const getDifficultyModifier = (difficulty: 'Easy' | 'Medium' | 'Hard'): number => {
  switch (difficulty) {
    case 'Easy': return 1.0;
    case 'Medium': return 1.5;
    case 'Hard': return 2.0;
    default: return 1.0;
  }
};
