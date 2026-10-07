import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/sound';
import { Dna, ShieldAlert, Award, Sparkles, X } from 'lucide-react';

interface DiceResultItem {
  playerId: string;
  playerName: string;
  roll: number;
  hpChange: number;
  evaluation: string;
}

interface DiceRollModalProps {
  isOpen: boolean;
  rolls: DiceResultItem[];
  onClose: () => void;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({ isOpen, rolls, onClose }) => {
  const [isRolling, setIsRolling] = useState(true);
  const [displayRolls, setDisplayRolls] = useState<number[]>([1, 1, 1, 1]);

  useEffect(() => {
    if (!isOpen) return;

    setIsRolling(true);
    soundManager.playDiceRoll();

    // Jitter roll numbers for suspense
    const interval = setInterval(() => {
      setDisplayRolls(rolls.map(() => Math.floor(Math.random() * 20) + 1));
    }, 80);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setDisplayRolls(rolls.map(r => r.roll));
      setIsRolling(false);

      // Play outcome audio
      if (rolls.some(r => r.roll === 20)) {
        soundManager.playCriticalSuccess();
      } else if (rolls.some(r => r.roll === 1)) {
        soundManager.playCriticalFail();
      } else if (rolls.some(r => r.hpChange < 0)) {
        soundManager.playDamageHit();
      }
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isOpen, rolls]);

  if (!isOpen) return null;

  const getRollBadge = (val: number) => {
    if (val === 20) {
      return {
        bg: 'bg-purple-900/60 border-purple-400 text-purple-300 ring-2 ring-purple-400/50',
        label: 'Đại Thành Công (CRIT 20)',
        icon: '🌟',
      };
    }
    if (val === 1) {
      return {
        bg: 'bg-red-950/80 border-red-500 text-red-300 ring-2 ring-red-500/50',
        label: 'Đại Thất Bại (FUMBLE 1)',
        icon: '💀',
      };
    }
    if (val >= 15) {
      return {
        bg: 'bg-emerald-950/60 border-emerald-500 text-emerald-300',
        label: 'Thành Công Tốt',
        icon: '✨',
      };
    }
    if (val >= 10) {
      return {
        bg: 'bg-amber-950/60 border-amber-500 text-amber-300',
        label: 'Thành Công Kèm Rủi Ro',
        icon: '⚠️',
      };
    }
    return {
      bg: 'bg-orange-950/60 border-orange-500 text-orange-300',
      label: 'Thất Bại',
      icon: '❌',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-7 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mb-2 border border-amber-500/30">
            <span className="text-2xl animate-spin-slow">🎲</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isRolling ? 'Game Master Đang Tung Xúc Xắc D20...' : 'Kết Quả Thử Thách Lượt Chơi!'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRolling
              ? 'Số phận và cơ hội của 4 người chơi đang được quyết định'
              : 'Đánh giá kỹ năng, sự phối hợp và độ may mắn D20 (1 - 20)'}
          </p>
        </div>

        {/* 4 Dice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {rolls.map((r, idx) => {
            const currentRoll = displayRolls[idx] || r.roll;
            const badge = getRollBadge(currentRoll);

            return (
              <div
                key={r.playerId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isRolling
                    ? 'bg-slate-800/60 border-slate-700 animate-pulse'
                    : `${badge.bg} shadow-lg`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300">
                    {r.playerId} • {r.playerName}
                  </span>
                  {!isRolling && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/60">
                      {badge.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Dice visual representation */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl select-none transition-transform ${
                      isRolling ? 'rotate-12 scale-105' : 'scale-100'
                    } ${
                      currentRoll === 20
                        ? 'bg-gradient-to-tr from-purple-600 to-amber-400 text-white shadow-lg shadow-purple-500/50'
                        : currentRoll === 1
                        ? 'bg-gradient-to-tr from-red-700 to-red-500 text-white shadow-lg shadow-red-500/50'
                        : currentRoll >= 15
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/30'
                        : currentRoll >= 10
                        ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950'
                        : 'bg-gradient-to-tr from-orange-700 to-slate-800 text-white'
                    }`}
                  >
                    D20: {currentRoll}
                  </div>

                  <div className="flex-1 min-w-0">
                    {!isRolling ? (
                      <>
                        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                          {r.evaluation}
                        </p>
                        {r.hpChange !== 0 && (
                          <div
                            className={`text-xs font-bold mt-1 inline-block ${
                              r.hpChange > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {r.hpChange > 0 ? `+${r.hpChange} HP hồi phục` : `${r.hpChange} HP`}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-slate-400 animate-pulse">
                        Đang tính toán ngẫu nhiên...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isRolling}
            onClick={onClose}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isRolling
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isRolling ? 'Đang Lắc Xí Ngầu...' : 'Tiếp Tục Diễn Biến Cốt Truyện →'}
          </button>
        </div>
      </div>
    </div>
  );
};
