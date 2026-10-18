import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fruit, AppSettings } from '../types/fruit';
import { Volume2, Play, Square, X, CheckCircle2 } from 'lucide-react';
import { speakText, soundController } from '../utils/audio';

interface AacGridModeProps {
  fruits: Fruit[];
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

export const AacGridMode: React.FC<AacGridModeProps> = ({
  fruits,
  settings,
  onUpdateSettings,
}) => {
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [scanIndex, setScanIndex] = useState<number>(0);
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isHC = settings.highContrast;

  // Determine fruits to display based on AAC grid setting
  const visibleFruits = React.useMemo(() => {
    if (settings.aacGridSize === '2x2') return fruits.slice(0, 4);
    if (settings.aacGridSize === '2x3') return fruits.slice(0, 6);
    return fruits.slice(0, 8);
  }, [fruits, settings.aacGridSize]);

  const handleFruitSelect = useCallback(
    (fruit: Fruit) => {
      if (settings.soundEffects) soundController.playSuccess();
      setSelectedFruit(fruit);
      speakText(`${fruit.name}! ${fruit.colorName} ${fruit.name}예요.`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    },
    [settings]
  );

  // Switch Scanning interval
  useEffect(() => {
    if (settings.switchScanEnabled) {
      scanTimerRef.current = setInterval(() => {
        setScanIndex((prev) => (prev + 1) % visibleFruits.length);
      }, settings.switchScanSpeed * 1000);
    } else {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    }

    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, [settings.switchScanEnabled, settings.switchScanSpeed, visibleFruits.length]);

  // Switch input handling (Space or Enter to select current scanned item)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.switchScanEnabled) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const target = visibleFruits[scanIndex];
        if (target) {
          handleFruitSelect(target);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.switchScanEnabled, scanIndex, visibleFruits, handleFruitSelect]);

  const toggleSwitchScan = () => {
    const next = !settings.switchScanEnabled;
    onUpdateSettings((prev) => ({ ...prev, switchScanEnabled: next }));
    speakText(
      next
        ? '스위치 자동 스캔을 켰습니다. 원하는 칸에 불이 들어올 때 화면을 누르거나 스페이스바를 누르세요.'
        : '자동 스캔을 껐습니다.',
      { rate: settings.speechRate, pitch: settings.speechPitch }
    );
  };

  const gridColsClass =
    settings.aacGridSize === '2x2'
      ? 'grid-cols-2 max-w-2xl'
      : settings.aacGridSize === '2x3'
        ? 'grid-cols-2 md:grid-cols-3 max-w-4xl'
        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-6xl';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top AAC Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 px-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-lg sm:text-xl font-extrabold ${
              isHC ? 'text-yellow-300' : 'text-amber-950'
            }`}
          >
            과일 낱말판 (AAC)
          </span>
          <span
            className={`text-xs sm:text-sm font-medium ${
              isHC ? 'text-yellow-100' : 'text-slate-500'
            }`}
          >
            터치하면 큰 소리로 말해요
          </span>
        </div>

        {/* Grid size and Switch Scan Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isHC ? 'bg-neutral-900 border-yellow-400' : 'bg-white border-amber-200'
            }`}
          >
            {(['2x2', '2x3', '2x4'] as const).map((size) => (
              <button
                key={size}
                onClick={() => {
                  onUpdateSettings((prev) => ({ ...prev, aacGridSize: size }));
                  if (settings.soundEffects) soundController.playTap();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                  settings.aacGridSize === size
                    ? isHC
                      ? 'bg-yellow-400 text-black'
                      : 'bg-amber-500 text-white'
                    : isHC
                      ? 'text-yellow-300 hover:bg-neutral-800'
                      : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                {size === '2x2' ? '4개' : size === '2x3' ? '6개' : '8개'}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSwitchScan}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-all ${
              settings.switchScanEnabled
                ? isHC
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                : isHC
                  ? 'bg-neutral-900 text-yellow-300 border-yellow-400'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            aria-pressed={settings.switchScanEnabled}
          >
            {settings.switchScanEnabled ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>스위치 스캔 {settings.switchScanEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Grid of AAC Fruit Buttons */}
      <div className={`w-full grid ${gridColsClass} gap-4 sm:gap-6`}>
        {visibleFruits.map((f, idx) => {
          const isScanned = settings.switchScanEnabled && scanIndex === idx;

          return (
            <button
              key={f.id}
              onClick={() => handleFruitSelect(f)}
              className={`relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between transition-all duration-200 border-4 cursor-pointer transform active:scale-95 ${
                isScanned ? 'scan-focus ring-8 ring-amber-400 scale-102' : ''
              } ${
                isHC
                  ? 'bg-neutral-900 border-yellow-400 text-yellow-300 hover:bg-neutral-800 hover:border-yellow-300'
                  : 'bg-white border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl'
              }`}
              style={{ minHeight: '180px' }}
              aria-label={`${f.name} 선택하기`}
            >
              {/* Extra large fruit image */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-amber-50/50 flex items-center justify-center border border-amber-100">
                <img
                  src={f.image}
                  alt={f.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Bold Large Name */}
              <div className="w-full flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-center">
                  {f.name}
                </span>
                <Volume2
                  className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${
                    isHC ? 'text-yellow-400' : 'text-amber-600'
                  }`}
                />
              </div>

              {isScanned && (
                <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500 text-white shadow-md animate-bounce">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Enlarged Focus Modal upon selection */}
      {selectedFruit && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedFruit(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border-4 flex flex-col items-center shadow-2xl relative ${
              isHC
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-white border-amber-300 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFruit(null)}
              className={`absolute top-4 right-4 p-2 rounded-full border-2 transition-transform hover:scale-110 ${
                isHC
                  ? 'border-yellow-400 text-yellow-300 hover:bg-neutral-900'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-4 border-amber-300 mb-6 bg-amber-50">
              <img
                src={selectedFruit.image}
                alt={selectedFruit.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-5xl sm:text-6xl font-black mb-2 text-center tracking-wide">
              {selectedFruit.name}
            </h2>
            <p
              className={`text-lg sm:text-xl font-bold mb-6 text-center ${
                isHC ? 'text-yellow-200' : 'text-slate-600'
              }`}
            >
              {selectedFruit.description}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleFruitSelect(selectedFruit)}
                className={`flex-1 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 border-3 transition-transform active:scale-95 ${
                  isHC
                    ? 'bg-yellow-400 text-black border-yellow-300'
                    : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md'
                }`}
              >
                <Volume2 className="w-6 h-6" />
                <span>소리 다시 듣기</span>
              </button>

              <button
                onClick={() => setSelectedFruit(null)}
                className={`py-4 px-6 rounded-2xl font-bold text-lg border-2 ${
                  isHC
                    ? 'border-yellow-400 text-yellow-300 hover:bg-neutral-900'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
