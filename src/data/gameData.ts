export interface WordData {
  id: number;
  word: string;
  syllables: string[];
  cn: string;
}

export const wordData: WordData[] = [
  { id: 1, word: 'memory', syllables: ['mem', 'o', 'ry'], cn: 'n. 记忆；回忆' },
  { id: 2, word: 'dungeon', syllables: ['dun', 'geon'], cn: 'n. 地牢；土牢' },
  { id: 3, word: 'fragment', syllables: ['frag', 'ment'], cn: 'n. 碎片；片段' },
  { id: 4, word: 'ephemeral', syllables: ['e', 'phem', 'er', 'al'], cn: 'adj. 短暂的' },
  { id: 5, word: 'abyss', syllables: ['a', 'byss'], cn: 'n. 深渊' },
  { id: 6, word: 'luminous', syllables: ['lu', 'mi', 'nous'], cn: 'adj. 发光的；明亮的' },
  { id: 7, word: 'ancient', syllables: ['an', 'cient'], cn: 'adj. 古老的；古代的' },
  { id: 8, word: 'whisper', syllables: ['whis', 'per'], cn: 'n. 低语；耳语' },
  { id: 9, word: 'phantom', syllables: ['phan', 'tom'], cn: 'n. 幻影；幽灵' },
  { id: 10, word: 'crystal', syllables: ['crys', 'tal'], cn: 'n. 水晶；结晶' },
  { id: 11, word: 'silence', syllables: ['si', 'lence'], cn: 'n. 沉默；寂静' },
  { id: 12, word: 'shadow', syllables: ['shad', 'ow'], cn: 'n. 阴影；影子' },
  { id: 13, word: 'echo', syllables: ['ech', 'o'], cn: 'n. 回声；回音' },
  { id: 14, word: 'mystery', syllables: ['mys', 'ter', 'y'], cn: 'n. 秘密；谜' },
  { id: 15, word: 'guardian', syllables: ['guard', 'i', 'an'], cn: 'n. 守护者；监护人' }
];
