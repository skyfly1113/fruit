import React from 'react';
import { AppMode, AppSettings } from '../types/fruit';
import { Settings, Eye, Volume2 } from 'lucide-react';
import { speakText, soundController } from '../utils/audio';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  settings,
  onUpdateSettings,
  onOpenSettings,
}) => {
  const handleModeChange = (mode: AppMode, label: string) => {
    if (settings.soundEffects) soundController.playTap();
    speakText(`${label} 모드로 이동합니다.`, { rate: settings.speechRate, pitch: settings.speechPitch });
    onSelectMode(mode);
  };

  const toggleHighContrast = () => {
    if (settings.soundEffects) soundController.playTap();
    onUpdateSettings(prev => {
      const next = !prev.highContrast;
      speakText(next ? '고대비 모드를 켰습니다.' : '일반 화면 모드입니다.', {
        rate: prev.speechRate,
        pitch: prev.speechPitch,
      });
      return { ...prev, highContrast: next };
    });
  };

  const isHC = settings.highContrast;

  return (
    <header
      className={`w-full border-b transition-colors ${
        isHC
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-white/95 backdrop-blur-md border-amber-200/70 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => handleModeChange('cards', '낱말 카드')}
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2.5 focus:outline-hidden ${
            isHC ? 'text-yellow-300 hover:text-yellow-200' : 'text-amber-900 hover:text-amber-800'
          }`}
          aria-label="과일 쏙쏙 홈으로 이동"
        >
          <span className="text-3xl" role="img" aria-label="사과">🍎</span>
          <span>과일 쏙쏙</span>
        </button>

        {/* Zone 2: Navigation Modes */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none" aria-label="학습 모드 선택">
          <button
            onClick={() => handleModeChange('cards', '낱말 카드')}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-base sm:text-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentMode === 'cards'
                ? isHC
                  ? 'bg-yellow-400 text-black shadow-md ring-2 ring-yellow-300'
                  : 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                : isHC
                  ? 'text-yellow-300 hover:bg-neutral-900'
                  : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <span>낱말 카드</span>
          </button>

          <button
            onClick={() => handleModeChange('aac', '낱말판')}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-base sm:text-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentMode === 'aac'
                ? isHC
                  ? 'bg-yellow-400 text-black shadow-md ring-2 ring-yellow-300'
                  : 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                : isHC
                  ? 'text-yellow-300 hover:bg-neutral-900'
                  : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <span>낱말판 (AAC)</span>
          </button>

          <button
            onClick={() => handleModeChange('quiz', '과일 찾기')}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-base sm:text-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentMode === 'quiz'
                ? isHC
                  ? 'bg-yellow-400 text-black shadow-md ring-2 ring-yellow-300'
                  : 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                : isHC
                  ? 'text-yellow-300 hover:bg-neutral-900'
                  : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <span>과일 찾기</span>
          </button>

          <button
            onClick={() => handleModeChange('basket', '바구니 담기')}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-base sm:text-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentMode === 'basket'
                ? isHC
                  ? 'bg-yellow-400 text-black shadow-md ring-2 ring-yellow-300'
                  : 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                : isHC
                  ? 'text-yellow-300 hover:bg-neutral-900'
                  : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <span>바구니 담기</span>
          </button>
        </nav>

        {/* Zone 3: Quick Accessibility & Settings */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleHighContrast}
            title={isHC ? '일반 화면으로 전환' : '고대비 화면으로 전환'}
            className={`p-2.5 rounded-xl font-bold text-sm sm:text-base transition-colors flex items-center gap-1.5 border ${
              isHC
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            aria-pressed={isHC}
          >
            <Eye className="w-5 h-5" />
            <span className="hidden md:inline whitespace-nowrap">{isHC ? '고대비 켬' : '고대비'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-sm sm:text-base transition-colors flex items-center gap-2 ${
              isHC
                ? 'bg-neutral-900 text-yellow-300 border border-yellow-400 hover:bg-neutral-800'
                : 'bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-300/80'
            }`}
            aria-label="특수교육 맞춤 설정 열기"
          >
            <Settings className="w-5 h-5 text-amber-600 dark:text-yellow-300" />
            <span className="hidden sm:inline whitespace-nowrap">설정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
