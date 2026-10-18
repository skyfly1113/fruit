import React from 'react';
import { AppSettings } from '../types/fruit';
import { X, Volume2, Eye, Sliders, Play, RotateCcw } from 'lucide-react';
import { speakText, soundController } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  const isHC = settings.highContrast;

  const testVoice = () => {
    speakText('사과! 빨갛고 달콤한 사과예요.', {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border-4 my-8 shadow-2xl relative transition-all ${
          isHC
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-amber-300 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200 dark:border-yellow-400/50 mb-6">
          <div className="flex items-center gap-3">
            <Sliders className="w-7 h-7 text-amber-600 dark:text-yellow-400" />
            <div>
              <h2 id="settings-title" className="text-2xl sm:text-3xl font-black">
                특수교육 맞춤 설정
              </h2>
              <p className="text-xs sm:text-sm font-semibold opacity-75">
                학생의 인지 및 지체 장애 특성에 맞춰 환경을 조절하세요
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2.5 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
              isHC
                ? 'border-yellow-400 text-yellow-300 hover:bg-neutral-900'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="설정창 닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Setting Groups */}
        <div className="space-y-6">
          {/* 1. Voice Speed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-500" />
                <span>음성 말하기 속도</span>
              </label>
              <button
                onClick={testVoice}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border flex items-center gap-1.5 ${
                  isHC
                    ? 'bg-yellow-400 text-black border-yellow-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>소리 테스트</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '아주 느리게 (0.7x)', val: 0.7 },
                { label: '조금 느리게 (0.85x)', val: 0.85 },
                { label: '보통 속도 (1.0x)', val: 1.0 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    onUpdateSettings((prev) => ({ ...prev, speechRate: opt.val }));
                    if (settings.soundEffects) soundController.playTap();
                  }}
                  className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${
                    settings.speechRate === opt.val
                      ? isHC
                        ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400'
                        : 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : isHC
                        ? 'border-neutral-800 text-yellow-300 hover:bg-neutral-900'
                        : 'border-slate-200 text-slate-700 hover:bg-amber-50/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. High Contrast Mode */}
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 bg-neutral-50/50 dark:bg-neutral-900/50 border-amber-200/80 dark:border-yellow-400/80">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-amber-600 dark:text-yellow-400 shrink-0" />
              <div>
                <div className="text-base sm:text-lg font-bold">
                  고대비 모드 (CVI / 저시력 지원)
                </div>
                <div className="text-xs sm:text-sm opacity-75">
                  검정 배경에 선명한 노란색/고대비로 시각 피로를 줄입니다
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onUpdateSettings((prev) => ({
                  ...prev,
                  highContrast: !prev.highContrast,
                }));
                if (settings.soundEffects) soundController.playTap();
              }}
              className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 border ${
                isHC
                  ? 'bg-yellow-400 border-yellow-300'
                  : 'bg-slate-300 border-slate-400'
              }`}
              aria-label="고대비 모드 켜기/끄기"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  isHC ? 'translate-x-6 bg-black' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Switch Access Auto-Scanning */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl border-2 bg-neutral-50/50 dark:bg-neutral-900/50 border-amber-200/80 dark:border-yellow-400/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base sm:text-lg font-bold">
                  스위치 자동 스캔 모드 (지체장애 학생 보조)
                </div>
                <div className="text-xs sm:text-sm opacity-75">
                  순차적으로 칸을 자동 강조하며, 화면 아무 곳이나 누르거나 스페이스바를 누르면 선택됩니다
                </div>
              </div>
              <button
                onClick={() => {
                  onUpdateSettings((prev) => ({
                    ...prev,
                    switchScanEnabled: !prev.switchScanEnabled,
                  }));
                  if (settings.soundEffects) soundController.playTap();
                }}
                className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 border shrink-0 ${
                  settings.switchScanEnabled
                    ? isHC
                      ? 'bg-yellow-400 border-yellow-300'
                      : 'bg-emerald-500 border-emerald-600'
                    : 'bg-slate-300 border-slate-400'
                }`}
                aria-label="스위치 스캔 모드 토글"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.switchScanEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.switchScanEnabled && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold">스캔 속도:</span>
                <div className="flex gap-2">
                  {[
                    { label: '빠르게 (1.5초)', val: 1.5 },
                    { label: '보통 (2.5초)', val: 2.5 },
                    { label: '천천히 (4.0초)', val: 4.0 },
                  ].map((speed) => (
                    <button
                      key={speed.val}
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          switchScanSpeed: speed.val,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        settings.switchScanSpeed === speed.val
                          ? isHC
                            ? 'bg-yellow-400 text-black border-yellow-300'
                            : 'bg-amber-500 text-white border-amber-600'
                          : isHC
                            ? 'border-neutral-800 text-yellow-300'
                            : 'border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Auto-Play Interval for Flashcards */}
          <div className="flex flex-col gap-2">
            <label className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-500" />
              <span>낱말 카드 자동 넘김 시간</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '3초마다 넘김', val: 3 },
                { label: '5초마다 넘김 (추천)', val: 5 },
                { label: '7초마다 넘김', val: 7 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    onUpdateSettings((prev) => ({
                      ...prev,
                      autoPlayInterval: item.val,
                    }));
                    if (settings.soundEffects) soundController.playTap();
                  }}
                  className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${
                    settings.autoPlayInterval === item.val
                      ? isHC
                        ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400'
                        : 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : isHC
                        ? 'border-neutral-800 text-yellow-300 hover:bg-neutral-900'
                        : 'border-slate-200 text-slate-700 hover:bg-amber-50/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-neutral-800">
            <span className="text-sm sm:text-base font-bold">
              버튼 터치 및 칭찬 효과음 (Web Audio)
            </span>
            <button
              onClick={() => {
                onUpdateSettings((prev) => ({
                  ...prev,
                  soundEffects: !prev.soundEffects,
                }));
                soundController.playTap();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                settings.soundEffects
                  ? isHC
                    ? 'bg-yellow-400 text-black border-yellow-300'
                    : 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {settings.soundEffects ? '효과음 켜짐' : '효과음 꺼짐'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-amber-200 dark:border-yellow-400/50 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              onResetSettings();
              soundController.playTap();
              speakText('설정을 초기 상태로 되돌렸습니다.');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition-all ${
              isHC
                ? 'border-neutral-800 text-yellow-200 hover:bg-neutral-900'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>기본값으로 복원</span>
          </button>

          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-black text-base border-2 transition-transform active:scale-95 ${
              isHC
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md'
            }`}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};
