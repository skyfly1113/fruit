import React, { useState, useEffect, useCallback } from 'react';
import { Fruit, AppSettings } from '../types/fruit';
import { Volume2, Star, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakText, soundController } from '../utils/audio';

interface QuizModeProps {
  fruits: Fruit[];
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  fruits,
  settings,
  onUpdateSettings,
}) => {
  const [targetFruit, setTargetFruit] = useState<Fruit>(fruits[0]);
  const [options, setOptions] = useState<Fruit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stars, setStars] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const isHC = settings.highContrast;

  // Generate a new round
  const startNewRound = useCallback(() => {
    setSelectedId(null);
    setIsCorrect(null);
    setFeedbackMessage('');

    // Pick random target fruit
    const randomIndex = Math.floor(Math.random() * fruits.length);
    const target = fruits[randomIndex];
    setTargetFruit(target);

    // Pick distractors based on settings.quizChoiceCount (2, 3, or 4)
    const otherFruits = fruits.filter((f) => f.id !== target.id);
    const shuffledOthers = [...otherFruits].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, settings.quizChoiceCount - 1);

    // Mix target and distractors
    const roundOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);

    // Announce the question via TTS
    setTimeout(() => {
      speakText(`${target.name}를 찾아보세요!`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }, 250);
  }, [fruits, settings.quizChoiceCount, settings.speechRate, settings.speechPitch]);

  // Initial round start
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  // Repeat question prompt
  const repeatPrompt = () => {
    if (settings.soundEffects) soundController.playTap();
    speakText(`${targetFruit.name}를 찾아보세요!`, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  // Choice click
  const handleChoiceClick = (fruit: Fruit) => {
    if (isCorrect === true) return; // already solved

    setSelectedId(fruit.id);

    if (fruit.id === targetFruit.id) {
      // Correct!
      setIsCorrect(true);
      setStars((prev) => prev + 1);
      setFeedbackMessage(`정답이에요! ${targetFruit.name}를 찾았어요!`);

      if (settings.soundEffects) {
        soundController.playSuccess();
        setTimeout(() => soundController.playFanfare(), 300);
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
        });
      } catch {
        // Fallback
      }

      speakText(`정답이에요! 참 잘했어요! ${targetFruit.name}예요!`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        onEnd: () => {
          setTimeout(startNewRound, 1500);
        },
      });
    } else {
      // Non-punitive gentle guiding
      setIsCorrect(false);
      setFeedbackMessage(`이것은 ${fruit.name}예요. 다시 찾아볼까요?`);

      if (settings.soundEffects) {
        soundController.playGentlePrompt();
      }

      speakText(`이것은 ${fruit.name}예요. ${targetFruit.name}를 찾아보세요!`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Quiz Top Status Bar */}
      <div className="w-full flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isHC
                ? 'bg-neutral-900 border-yellow-400 text-yellow-300'
                : 'bg-white border-amber-200 text-amber-900 shadow-xs'
            }`}
          >
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            <span className="font-mono text-xl font-black">{stars}</span>
            <span className="text-xs font-bold text-slate-500">개 획득!</span>
          </div>
        </div>

        {/* Choice Count Selector */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${
              isHC ? 'text-yellow-200' : 'text-slate-600'
            }`}
          >
            보기 개수:
          </span>
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isHC ? 'bg-neutral-900 border-yellow-400' : 'bg-white border-amber-200'
            }`}
          >
            {([2, 3, 4] as const).map((cnt) => (
              <button
                key={cnt}
                onClick={() => {
                  onUpdateSettings((prev) => ({ ...prev, quizChoiceCount: cnt }));
                  if (settings.soundEffects) soundController.playTap();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  settings.quizChoiceCount === cnt
                    ? isHC
                      ? 'bg-yellow-400 text-black'
                      : 'bg-amber-500 text-white'
                    : isHC
                      ? 'text-yellow-300 hover:bg-neutral-800'
                      : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                {cnt === 2 ? '2개 (쉬움)' : `${cnt}개`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target Question Box */}
      <div
        className={`w-full rounded-3xl p-6 sm:p-8 mb-8 border-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
          isHC
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-amber-200/90 shadow-amber-900/5'
        }`}
      >
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div
            className={`text-sm sm:text-base font-bold mb-1 ${
              isHC ? 'text-yellow-200' : 'text-slate-500'
            }`}
          >
            소리를 듣고 과일을 찾아보세요
          </div>
          <div className="text-4xl sm:text-6xl font-black tracking-tight text-amber-950 dark:text-yellow-300">
            &ldquo;{targetFruit.name}&rdquo;
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={repeatPrompt}
            className={`px-6 py-4 rounded-2xl font-black text-xl sm:text-2xl flex items-center gap-3 border-3 transition-transform active:scale-95 shadow-md ${
              isHC
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/30'
            }`}
            aria-label={`${targetFruit.name} 찾기 음성 다시 듣기`}
          >
            <Volume2 className="w-8 h-8" />
            <span>다시 듣기</span>
          </button>

          <button
            onClick={startNewRound}
            className={`p-4 rounded-2xl border-2 transition-transform hover:rotate-45 active:scale-95 ${
              isHC
                ? 'border-yellow-400 text-yellow-300 bg-neutral-900 hover:bg-neutral-800'
                : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'
            }`}
            title="다른 문제로 바꾸기"
            aria-label="다른 문제로 바꾸기"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Options Cards */}
      <div
        className={`w-full grid gap-4 sm:gap-6 ${
          settings.quizChoiceCount === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
            : settings.quizChoiceCount === 3
              ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl'
              : 'grid-cols-2 sm:grid-cols-4 max-w-5xl'
        }`}
      >
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isThisCorrect = isSelected && isCorrect === true;
          const isThisWrong = isSelected && isCorrect === false;

          return (
            <button
              key={opt.id}
              onClick={() => handleChoiceClick(opt)}
              disabled={isCorrect === true}
              className={`relative rounded-3xl p-5 flex flex-col items-center border-4 transition-all duration-200 cursor-pointer active:scale-95 ${
                isThisCorrect
                  ? isHC
                    ? 'bg-neutral-900 border-green-400 text-green-300 scale-105 ring-8 ring-green-400/40'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-900 scale-105 ring-8 ring-emerald-400/30 shadow-2xl'
                  : isThisWrong
                    ? isHC
                      ? 'bg-neutral-900 border-yellow-500/50 text-yellow-100'
                      : 'bg-amber-50/50 border-amber-300 text-slate-700'
                    : isHC
                      ? 'bg-neutral-900 border-yellow-400 text-yellow-300 hover:bg-neutral-800'
                      : 'bg-white border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl'
              }`}
              style={{ minHeight: '220px' }}
              aria-label={`${opt.name} 선택하기`}
            >
              {/* Extra large fruit image */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-amber-50/40 border border-amber-100 flex items-center justify-center">
                <img
                  src={opt.image}
                  alt={opt.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Fruit Name */}
              <div className="text-3xl sm:text-4xl font-black tracking-wide text-center">
                {opt.name}
              </div>

              {/* Status Indicator */}
              {isThisCorrect && (
                <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500 text-white shadow-lg animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Encouraging Feedback Bar */}
      {feedbackMessage && (
        <div
          className={`mt-6 px-6 py-4 rounded-2xl border-2 text-xl sm:text-2xl font-black text-center animate-in fade-in flex items-center justify-center gap-3 ${
            isCorrect
              ? isHC
                ? 'bg-neutral-900 border-green-400 text-green-300'
                : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-md'
              : isHC
                ? 'bg-neutral-900 border-yellow-400 text-yellow-300'
                : 'bg-amber-100 border-amber-300 text-amber-950 shadow-sm'
          }`}
        >
          {isCorrect && <Sparkles className="w-7 h-7 text-amber-500" />}
          <span>{feedbackMessage}</span>
        </div>
      )}
    </div>
  );
};
