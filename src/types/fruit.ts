export interface Fruit {
  id: string;
  name: string;
  englishName: string;
  syllables: string[];
  image: string;
  colorName: string;
  colorCode: string;
  taste: string;
  description: string;
  voiceIntro: string;
  funFact: string;
  theme: {
    bgLight: string;
    borderLight: string;
    textLight: string;
    accent: string;
  };
}

export type AppMode = 'cards' | 'aac' | 'quiz' | 'basket';

export interface AppSettings {
  speechRate: number; // 0.7, 0.85, 1.0
  speechPitch: number; // 1.0 to 1.2
  highContrast: boolean; // black & yellow high contrast for CVI
  largeText: boolean;
  soundEffects: boolean;
  autoPlayInterval: number; // seconds
  aacGridSize: '2x2' | '2x3' | '2x4';
  quizChoiceCount: 2 | 3 | 4;
  switchScanEnabled: boolean;
  switchScanSpeed: number; // seconds
}
