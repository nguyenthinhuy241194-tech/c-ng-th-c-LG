import React from 'react';
import { PlayerState } from '../types/game';
import { Heart, Activity, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface PlayerCardProps {
  player: PlayerState;
  actionText: string;
  onActionChange: (text: string) => void;
  quickActions?: string[];
  disabled?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  actionText,
  onActionChange,
  quickActions = [],
  disabled = false,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  const getHpColor = () => {
    if (player.hp <= 0) return 'bg-red-950 text-red-500';
    if (player.hp < 30) return 'bg-red-500';
    if (player.hp < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getRoleTheme = (id: string) => {
    switch (id) {
      case 'P1':
        return {
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          border: 'border-emerald-500/30',
        };
      case 'P2':
        return {
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          border: 'border-blue-500/30',
        };
      case 'P3':
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          border: 'border-amber-500/30',
        };
      case 'P4':
        return {
          badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          border: 'border-purple-500/30',
        };
      default:
        return {
          badge: 'bg-slate-700 text-slate-300 border-slate-600',
          border: 'border-slate-700',
        };
    }
  };

  const theme = getRoleTheme(player.id);
  const isReady = actionText.trim().length > 0;

  const handlePickQuickAction = (act: string) => {
    soundManager.playClick();
    onActionChange(act);
  };

  return (
    <div
      className={`rounded-2xl border bg-slate-900/90 p-4 transition-all flex flex-col justify-between shadow-lg relative ${
        isReady ? 'border-amber-400/60 ring-1 ring-amber-400/30' : theme.border
      } ${player.hp <= 0 ? 'opacity-70 grayscale-50' : ''}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
              {player.avatarIcon || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${theme.badge}`}>
                  {player.id}
                </span>
                <h4 className="font-bold text-sm text-white truncate max-w-[120px] sm:max-w-[150px]">
                  {player.name}
                </h4>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                {player.role}
              </p>
            </div>
          </div>

          {/* Ready status indicator */}
          <div className="flex flex-col items-end">
            {isReady ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Đã sẵn sàng
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400/90 bg-amber-950/40 border border-amber-600/30 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> Chờ hành động
              </span>
            )}
          </div>
        </div>

        {/* Health Bar */}
        <div className="mb-3.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Heart className={`w-3.5 h-3.5 ${player.hp < 30 ? 'text-red-400 fill-red-400 animate-pulse' : 'text-red-400'}`} />
              Sức Khỏe (HP)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">{player.status}</span>
              <span
                className={`font-mono font-bold text-xs ${
                  player.hp < 30 ? 'text-red-400' : player.hp < 70 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {player.hp} / {player.maxHp}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getHpColor()}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Last roll snippet if available */}
          {player.lastRoll && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Xí ngầu trước: <strong className="text-amber-300">D20: {player.lastRoll.roll}</strong>
              </span>
              {player.lastRoll.hpChange !== 0 && (
                <span
                  className={`font-bold ${
                    player.lastRoll.hpChange > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {player.lastRoll.hpChange > 0 ? `+${player.lastRoll.hpChange}` : player.lastRoll.hpChange} HP
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Input Area */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Hành động lượt này:</span>
        </label>

        <textarea
          rows={2}
          disabled={disabled || player.hp <= 0}
          value={player.hp <= 0 ? 'Nhân vật đang hôn mê / mất ý thức, cần đồng đội cứu giúp!' : actionText}
          onChange={e => onActionChange(e.target.value)}
          placeholder={`Ví dụ: ${player.name} làm gì trong tình thế này?...`}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:bg-slate-950/40 disabled:text-slate-600 resize-none transition-all"
        />

        {/* Quick action pill suggestions */}
        {quickActions.length > 0 && player.hp > 0 && !disabled && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickActions.map((act, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePickQuickAction(act)}
                className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 px-2 py-1 rounded-lg transition-colors text-left truncate max-w-full cursor-pointer active:scale-95"
                title={act}
              >
                ⚡ {act}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
