import React, { useState, useEffect, useCallback } from 'react';
import { Fruit, AppSettings } from '../types/fruit';
import { Volume2, Sparkles, ShoppingBag, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakText, soundController } from '../utils/audio';

interface FruitBasketModeProps {
  fruits: Fruit[];
  settings: AppSettings;
}

export const FruitBasketMode: React.FC<FruitBasketModeProps> = ({
  fruits,
  settings,
}) => {
  const [basket, setBasket] = useState<Fruit[]>([]);
  const [targetFruit, setTargetFruit] = useState<Fruit>(fruits[0]);
  const [availableFruits, setAvailableFruits] = useState<Fruit[]>([]);
  const isHC = settings.highContrast;

  const pickNewTarget = useCallback(
    (currentBasket: Fruit[]) => {
      const remaining = fruits.filter(
        (f) => !currentBasket.some((bf) => bf.id === f.id)
      );

      if (remaining.length === 0) {
        // All fruits collected in the basket!
        if (settings.soundEffects) {
          soundController.playFanfare();
        }
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {
          // Fallback
        }
        speakText('와아! 바구니에 과일을 가득 담았어요! 정말 최고예요!', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
        return;
      }

      // Pick a random fruit from remaining
      const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];
      setTargetFruit(nextTarget);

      // Distractors: target + 2 or 3 other fruits
      const otherFruits = fruits.filter((f) => f.id !== nextTarget.id);
      const shuffledOthers = [...otherFruits].sort(() => Math.random() - 0.5);
      const pool = [nextTarget, ...shuffledOthers.slice(0, 3)].sort(
        () => Math.random() - 0.5
      );
      setAvailableFruits(pool);

      setTimeout(() => {
        speakText(`${nextTarget.name}를 바구니에 쏙 담아주세요!`, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }, 300);
    },
    [fruits, settings.speechRate, settings.speechPitch, settings.soundEffects]
  );

  useEffect(() => {
    pickNewTarget([]);
  }, [pickNewTarget]);

  const handleFruitClick = (fruit: Fruit) => {
    if (basket.some((f) => f.id === fruit.id)) return; // already added

    if (fruit.id === targetFruit.id) {
      if (settings.soundEffects) soundController.playSuccess();
      const updatedBasket = [...basket, fruit];
      setBasket(updatedBasket);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Fallback
      }

      speakText(`${fruit.name}를 바구니에 쏙 담았어요!`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        onEnd: () => {
          pickNewTarget(updatedBasket);
        },
      });
    } else {
      if (settings.soundEffects) soundController.playGentlePrompt();
      speakText(`이것은 ${fruit.name}예요. ${targetFruit.name}를 바구니에 담아볼까요?`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  const handleResetBasket = () => {
    if (settings.soundEffects) soundController.playTap();
    setBasket([]);
    pickNewTarget([]);
    speakText('바구니를 비우고 다시 시작해요.', {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  const repeatPrompt = () => {
    if (settings.soundEffects) soundController.playTap();
    speakText(`${targetFruit.name}를 바구니에 쏙 담아주세요!`, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  const isCompleted = basket.length === fruits.length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top Banner & Reset */}
      <div className="w-full flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <ShoppingBag
            className={`w-7 h-7 ${
              isHC ? 'text-yellow-400' : 'text-amber-700'
            }`}
          />
          <span
            className={`text-xl sm:text-2xl font-black ${
              isHC ? 'text-yellow-300' : 'text-amber-950'
            }`}
          >
            과일 바구니 담기 ({basket.length} / {fruits.length})
          </span>
        </div>

        <button
          onClick={handleResetBasket}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
            isHC
              ? 'bg-neutral-900 text-yellow-300 border-yellow-400 hover:bg-neutral-800'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
          aria-label="바구니 비우고 다시하기"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 담기</span>
        </button>
      </div>

      {/* Target prompt */}
      {!isCompleted ? (
        <div
          className={`w-full rounded-3xl p-6 sm:p-8 mb-8 border-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
            isHC
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-white border-amber-200/90 shadow-amber-900/5'
          }`}
        >
          <div className="text-center sm:text-left">
            <div
              className={`text-sm sm:text-base font-bold mb-1 ${
                isHC ? 'text-yellow-200' : 'text-slate-500'
              }`}
            >
              바구니에 담을 과일
            </div>
            <div className="text-4xl sm:text-6xl font-black tracking-tight text-amber-950 dark:text-yellow-300">
              &ldquo;{targetFruit.name}&rdquo;
            </div>
          </div>

          <button
            onClick={repeatPrompt}
            className={`px-6 py-4 rounded-2xl font-black text-xl sm:text-2xl flex items-center gap-3 border-3 transition-transform active:scale-95 shadow-md ${
              isHC
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/30'
            }`}
            aria-label={`${targetFruit.name} 담기 음성 다시 듣기`}
          >
            <Volume2 className="w-8 h-8" />
            <span>소리 듣기</span>
          </button>
        </div>
      ) : (
        <div
          className={`w-full rounded-3xl p-8 mb-8 border-4 flex flex-col items-center text-center shadow-xl ${
            isHC
              ? 'bg-neutral-900 border-green-400 text-green-300'
              : 'bg-emerald-50 border-emerald-400 text-emerald-950'
          }`}
        >
          <Sparkles className="w-12 h-12 text-amber-500 mb-2 animate-bounce" />
          <h2 className="text-4xl sm:text-5xl font-black mb-2">
            축하합니다! 바구니 완성!
          </h2>
          <p className="text-xl font-bold mb-4">
            모든 과일을 맛있는 바구니에 가득 담았어요!
          </p>
          <button
            onClick={handleResetBasket}
            className={`px-8 py-4 rounded-2xl font-black text-2xl border-3 transition-transform active:scale-95 ${
              isHC
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
            }`}
          >
            한 번 더 담아보기
          </button>
        </div>
      )}

      {/* Selectable fruits to put into basket */}
      {!isCompleted && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {availableFruits.map((fruit) => {
            return (
              <button
                key={fruit.id}
                onClick={() => handleFruitClick(fruit)}
                className={`relative rounded-3xl p-4 flex flex-col items-center border-4 transition-all duration-200 cursor-pointer active:scale-95 ${
                  isHC
                    ? 'bg-neutral-900 border-yellow-400 text-yellow-300 hover:bg-neutral-800'
                    : 'bg-white border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl'
                }`}
                aria-label={`${fruit.name} 바구니에 담기`}
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-amber-50/40 border border-amber-100 flex items-center justify-center">
                  <img
                    src={fruit.image}
                    alt={fruit.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-center">
                  {fruit.name}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* The Fruit Basket Visualization */}
      <div
        className={`w-full rounded-3xl p-6 sm:p-8 border-4 flex flex-col items-center transition-all ${
          isHC
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-amber-100/60 border-amber-300 text-amber-950 shadow-inner'
        }`}
      >
        <div className="text-lg sm:text-xl font-black mb-4 flex items-center gap-2">
          <span>🧺 우리 과일 바구니</span>
          <span className="text-sm font-semibold opacity-75">
            (담긴 과일을 누르면 이름을 다시 들려줘요)
          </span>
        </div>

        {basket.length === 0 ? (
          <div className="py-12 text-center text-lg font-bold opacity-60">
            바구니가 비어 있어요. 위에서 과일을 눌러 담아보세요!
          </div>
        ) : (
          <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {basket.map((fruit, idx) => (
              <button
                key={`basket-${fruit.id}-${idx}`}
                onClick={() => {
                  if (settings.soundEffects) soundController.playTap();
                  speakText(fruit.name, {
                    rate: settings.speechRate,
                    pitch: settings.speechPitch,
                  });
                }}
                className={`flex flex-col items-center p-3 rounded-2xl border-3 transition-transform hover:scale-105 active:scale-95 animate-in zoom-in-75 ${
                  isHC
                    ? 'bg-neutral-900 border-yellow-400 text-yellow-300'
                    : 'bg-white border-amber-300 text-amber-900 shadow-md'
                }`}
                title={`${fruit.name} 소리 듣기`}
                aria-label={`바구니 속 ${fruit.name}`}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden mb-2">
                  <img
                    src={fruit.image}
                    alt={fruit.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg sm:text-xl font-black">{fruit.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
