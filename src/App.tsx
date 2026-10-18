/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppMode, AppSettings } from './types/fruit';
import { FRUITS_DATA } from './data/fruits';
import { Header } from './components/Header';
import { CardMode } from './components/CardMode';
import { AacGridMode } from './components/AacGridMode';
import { QuizMode } from './components/QuizMode';
import { FruitBasketMode } from './components/FruitBasketMode';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.85,
  speechPitch: 1.05,
  highContrast: false,
  largeText: true,
  soundEffects: true,
  autoPlayInterval: 5,
  aacGridSize: '2x3',
  quizChoiceCount: 2,
  switchScanEnabled: false,
  switchScanSpeed: 2.5,
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('cards');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('fruit_app_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('fruit_app_settings', JSON.stringify(settings));
    } catch {
      // Fallback
    }
  }, [settings]);

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const isHC = settings.highContrast;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isHC
          ? 'bg-black text-yellow-300'
          : 'bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-100/40 text-slate-900'
      }`}
    >
      {/* Universal Header with Top Bar Contract */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4 sm:py-6">
        {currentMode === 'cards' && (
          <CardMode fruits={FRUITS_DATA} settings={settings} />
        )}

        {currentMode === 'aac' && (
          <AacGridMode
            fruits={FRUITS_DATA}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}

        {currentMode === 'quiz' && (
          <QuizMode
            fruits={FRUITS_DATA}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}

        {currentMode === 'basket' && (
          <FruitBasketMode fruits={FRUITS_DATA} settings={settings} />
        )}
      </main>

      {/* Teacher / Parent Accessibility Guidance Bar */}
      <footer
        className={`w-full py-4 px-6 border-t text-center text-xs sm:text-sm font-semibold transition-colors ${
          isHC
            ? 'border-yellow-400/40 text-yellow-200/80 bg-neutral-950'
            : 'border-amber-200/80 text-amber-950/70 bg-amber-50/40'
        }`}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            특수교육 지원: 큰 이미지 터치 · 한국어 음성 피드백 · CVI 고대비 지원 · 스위치 자동 스캔
          </span>
          <span className="font-mono text-xs opacity-75">
            단축키: [스페이스바/엔터] 음성 다시 듣기 / 선택
          </span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetSettings={resetSettings}
      />
    </div>
  );
}
