export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface WordData {
  id: number;
  word: string;
  syllables: string[];
  cn: string;
  difficulty: Difficulty;
}

export const wordData: WordData[] = [
  { id: 1, word: 'memory', syllables: ['mem', 'o', 'ry'], cn: 'n. 记忆；回忆', difficulty: 'Easy' },
  { id: 2, word: 'dungeon', syllables: ['dun', 'geon'], cn: 'n. 地牢；土牢', difficulty: 'Easy' },
  { id: 3, word: 'fragment', syllables: ['frag', 'ment'], cn: 'n. 碎片；片段', difficulty: 'Easy' },
  { id: 4, word: 'ephemeral', syllables: ['e', 'phem', 'er', 'al'], cn: 'adj. 短暂的', difficulty: 'Hard' },
  { id: 5, word: 'abyss', syllables: ['a', 'byss'], cn: 'n. 深渊', difficulty: 'Medium' },
  { id: 6, word: 'luminous', syllables: ['lu', 'mi', 'nous'], cn: 'adj. 发光的；明亮的', difficulty: 'Medium' },
  { id: 7, word: 'ancient', syllables: ['an', 'cient'], cn: 'adj. 古老的；古代的', difficulty: 'Easy' },
  { id: 8, word: 'whisper', syllables: ['whis', 'per'], cn: 'n. 低语；耳语', difficulty: 'Easy' },
  { id: 9, word: 'phantom', syllables: ['phan', 'tom'], cn: 'n. 幻影；幽灵', difficulty: 'Medium' },
  { id: 10, word: 'crystal', syllables: ['crys', 'tal'], cn: 'n. 水晶；结晶', difficulty: 'Medium' },
  { id: 11, word: 'silence', syllables: ['si', 'lence'], cn: 'n. 沉默；寂静', difficulty: 'Easy' },
  { id: 12, word: 'shadow', syllables: ['shad', 'ow'], cn: 'n. 阴影；影子', difficulty: 'Easy' },
  { id: 13, word: 'echo', syllables: ['ech', 'o'], cn: 'n. 回声；回音', difficulty: 'Easy' },
  { id: 14, word: 'mystery', syllables: ['mys', 'ter', 'y'], cn: 'n. 秘密；谜', difficulty: 'Medium' },
  { id: 15, word: 'guardian', syllables: ['guard', 'i', 'an'], cn: 'n. 守护者；监护人', difficulty: 'Medium' }
];
