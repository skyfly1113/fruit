import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fruit, AppSettings } from '../types/fruit';
import { Volume2, ChevronLeft, ChevronRight, Play, Pause, Sparkles, BookOpen } from 'lucide-react';
import { speakText, soundController } from '../utils/audio';

interface CardModeProps {
  fruits: Fruit[];
  settings: AppSettings;
}

export const CardMode: React.FC<CardModeProps> = ({ fruits, settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeSyllable, setActiveSyllable] = useState<number | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fruit = fruits[currentIndex];
  const isHC = settings.highContrast;

  const speakCurrentFruit = useCallback(
    (includeDescription = false) => {
      if (!fruit) return;
      if (settings.soundEffects) soundController.playTap();

      const text = includeDescription
        ? `${fruit.name}. ${fruit.colorName} 과일이에요. ${fruit.taste}.`
        : fruit.voiceIntro;

      speakText(text, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    },
    [fruit, settings]
  );

  // Speak automatically when card changes
  useEffect(() => {
    speakCurrentFruit(false);
  }, [currentIndex, speakCurrentFruit]);

  // Handle auto-advance
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % fruits.length);
      }, settings.autoPlayInterval * 1000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, fruits.length, settings.autoPlayInterval]);

  const handleNext = () => {
    if (settings.soundEffects) soundController.playTap();
    setCurrentIndex((prev) => (prev + 1) % fruits.length);
  };

  const handlePrev = () => {
    if (settings.soundEffects) soundController.playTap();
    setCurrentIndex((prev) => (prev - 1 + fruits.length) % fruits.length);
  };

  const handleSyllableClick = (syllable: string, index: number) => {
    if (settings.soundEffects) soundController.playTap();
    setActiveSyllable(index);
    speakText(syllable, {
      rate: Math.max(0.65, settings.speechRate - 0.1),
      pitch: settings.speechPitch + 0.1,
      onEnd: () => setActiveSyllable(null),
    });
    setTimeout(() => setActiveSyllable(null), 800);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        speakCurrentFruit(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, speakCurrentFruit]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Top control bar: Progress & Auto-play */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xl sm:text-2xl font-black ${
              isHC ? 'text-yellow-300' : 'text-amber-900'
            }`}
          >
            {currentIndex + 1} / {fruits.length}
          </span>
          <span
            className={`text-sm sm:text-base font-semibold ${
              isHC ? 'text-yellow-100' : 'text-slate-600'
            }`}
          >
            {fruit.englishName}
          </span>
        </div>

        <button
          onClick={() => {
            const next = !isAutoPlaying;
            setIsAutoPlaying(next);
            speakText(next ? '자동 넘김을 시작합니다.' : '자동 넘김을 멈췄습니다.', {
              rate: settings.speechRate,
              pitch: settings.speechPitch,
            });
          }}
          className={`px-4 py-2 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all border ${
            isAutoPlaying
              ? isHC
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : isHC
                ? 'bg-neutral-900 text-yellow-300 border-yellow-400'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
          aria-label={isAutoPlaying ? '자동 넘김 일시정지' : '자동 넘김 시작'}
        >
          {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isAutoPlaying ? '자동 넘김 중' : '자동 넘김'}</span>
        </button>
      </div>

      {/* Main Flashcard Container */}
      <div
        className={`w-full rounded-3xl p-6 sm:p-10 transition-all border-4 flex flex-col items-center shadow-xl ${
          isHC
            ? 'bg-black border-yellow-400 text-yellow-300 shadow-yellow-500/10'
            : 'bg-white border-amber-200/90 shadow-amber-900/5'
        }`}
      >
        {/* Giant Fruit Image */}
        <div
          onClick={() => speakCurrentFruit(false)}
          className={`relative group cursor-pointer w-full max-w-md sm:max-w-lg aspect-square rounded-2xl overflow-hidden mb-6 sm:mb-8 border-4 transition-transform active:scale-95 duration-200 ${
            isHC
              ? 'border-yellow-400 bg-neutral-900'
              : 'border-amber-100 bg-amber-50/50 shadow-inner'
          }`}
          role="button"
          tabIndex={0}
          aria-label={`${fruit.name} 사진을 눌러 음성 듣기`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              speakCurrentFruit(false);
            }
          }}
        >
          <img
            src={fruit.image}
            alt={fruit.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Graceful styled fallback container
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
          <div
            className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
              isHC ? 'bg-yellow-400 text-black' : 'bg-white/95 text-amber-700 shadow-md'
            }`}
          >
            <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
        </div>

        {/* Syllable Breakdown and Main Word */}
        <div className="w-full flex flex-col items-center gap-4 mb-6">
          {/* Main Huge Fruit Title */}
          <button
            onClick={() => speakCurrentFruit(false)}
            className={`text-5xl sm:text-7xl font-black tracking-wide text-center transition-transform hover:scale-105 active:scale-95 ${
              isHC ? 'text-yellow-300' : 'text-slate-900'
            }`}
            aria-label={`${fruit.name} 이름 전체 듣기`}
          >
            {fruit.name}
          </button>

          {/* Interactive Syllable Blocks (한 글자씩 또박또박 익히기) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {fruit.syllables.map((syl, idx) => (
              <button
                key={`${fruit.id}-syl-${idx}`}
                onClick={() => handleSyllableClick(syl, idx)}
                className={`min-w-16 sm:min-w-20 min-h-16 sm:min-h-20 px-4 py-2 rounded-2xl text-3xl sm:text-4xl font-extrabold flex items-center justify-center border-3 transition-all transform active:scale-90 ${
                  activeSyllable === idx
                    ? isHC
                      ? 'bg-yellow-400 text-black border-white scale-110'
                      : 'bg-amber-500 text-white border-amber-600 scale-110 shadow-lg'
                    : isHC
                      ? 'bg-neutral-900 text-yellow-300 border-yellow-400 hover:bg-neutral-800'
                      : 'bg-amber-100/70 text-amber-950 border-amber-300 hover:bg-amber-200'
                }`}
                aria-label={`음절 ${syl} 소리 듣기`}
              >
                {syl}
              </button>
            ))}
          </div>

          <p
            className={`text-sm sm:text-base font-semibold ${
              isHC ? 'text-yellow-200' : 'text-slate-500'
            }`}
          >
            글자를 누르면 한 글자씩 소리를 들려줘요
          </p>
        </div>

        {/* Sensory Characteristics (색깔 & 맛) */}
        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div
            className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 ${
              isHC
                ? 'bg-neutral-900 border-yellow-400/80 text-yellow-200'
                : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
            }`}
          >
            <div
              className="w-6 h-6 rounded-full shrink-0 border-2 border-white shadow-xs"
              style={{ backgroundColor: fruit.colorCode }}
              aria-hidden="true"
            />
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-yellow-400">색깔</div>
              <div className="text-lg font-bold">{fruit.colorName}</div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 ${
              isHC
                ? 'bg-neutral-900 border-yellow-400/80 text-yellow-200'
                : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
            }`}
          >
            <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-yellow-400">맛과 느낌</div>
              <div className="text-lg font-bold truncate">{fruit.taste}</div>
            </div>
          </div>
        </div>

        {/* Big Speech Action Buttons */}
        <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <button
            onClick={() => speakCurrentFruit(false)}
            className={`flex-1 py-4 px-6 rounded-2xl font-extrabold text-xl sm:text-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 border-3 ${
              isHC
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/30'
            }`}
            aria-label={`${fruit.name} 이름 다시 듣기`}
          >
            <Volume2 className="w-7 h-7 shrink-0" />
            <span>이름 듣기</span>
          </button>

          <button
            onClick={() => speakCurrentFruit(true)}
            className={`flex-1 py-4 px-6 rounded-2xl font-extrabold text-xl sm:text-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 border-3 ${
              isHC
                ? 'bg-neutral-900 text-yellow-300 border-yellow-400 hover:bg-neutral-800'
                : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
            }`}
            aria-label={`${fruit.name} 설명 자세히 듣기`}
          >
            <BookOpen className="w-7 h-7 shrink-0" />
            <span>설명 듣기</span>
          </button>
        </div>
      </div>

      {/* Huge Previous / Next Navigation Controls (Touch Targets >= 64px) */}
      <div className="w-full max-w-5xl mt-6 flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className={`flex-1 h-20 sm:h-24 rounded-2xl border-4 font-black text-2xl sm:text-3xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
            isHC
              ? 'bg-neutral-900 text-yellow-300 border-yellow-400 hover:bg-neutral-800'
              : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-50 shadow-md'
          }`}
          aria-label="이전 과일 카드 보기"
        >
          <ChevronLeft className="w-10 h-10" />
          <span>이전 과일</span>
        </button>

        <button
          onClick={handleNext}
          className={`flex-1 h-20 sm:h-24 rounded-2xl border-4 font-black text-2xl sm:text-3xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
            isHC
              ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
              : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-lg shadow-amber-500/30'
          }`}
          aria-label="다음 과일 카드 보기"
        >
          <span>다음 과일</span>
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};
