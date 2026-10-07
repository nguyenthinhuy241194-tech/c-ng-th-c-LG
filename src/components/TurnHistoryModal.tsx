import React, { useState } from 'react';
import { TurnHistoryItem } from '../types/game';
import { BookOpen, Copy, Check, X, ShieldAlert, Award } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TurnHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TurnHistoryItem[];
  world: string;
  goal: string;
}

export const TurnHistoryModal: React.FC<TurnHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  world,
  goal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyStory = () => {
    soundManager.playClick();
    const textStory = `=== NHẬT KÝ CHIẾN DỊCH PHIÊU LƯU 4P ===\nThế giới: ${world}\nMục tiêu: ${goal}\n\n` +
      history
        .map(
          h =>
            `--- LƯỢT ${h.turn} (${h.timeOrProgress}) ---\n` +
            `Tình huống: ${h.situation}\n\n` +
            `Hành động nhóm:\n` +
            h.actions.map(a => `• ${a.playerId} - ${a.playerName} (${a.role}): "${a.actionText}"`).join('\n') +
            `\n\nKết quả D20:\n` +
            h.d20Rolls.map(r => `• ${r.playerName}: D20 = ${r.roll} (${r.evaluation})`).join('\n') +
            `\n\nDiễn biến Game Master:\n${h.outcome}\n\n`
        )
        .join('\n');

    navigator.clipboard.writeText(textStory);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-7 text-white flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">Nhật Ký Hành Trình Cuộc Phiêu Lưu</h3>
              <p className="text-xs text-slate-400">Xem lại toàn bộ diễn biến các lượt chơi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStory}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép!' : 'Sao chép nhật ký'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="py-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Chưa có dữ liệu lượt chơi. Hãy bắt đầu lượt 1!
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.turn}
                className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Lượt {item.turn}
                  </span>
                  <span className="text-xs text-slate-400">{item.timeOrProgress}</span>
                </div>

                {/* Situation */}
                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-semibold text-amber-400/90 block mb-0.5">Tình huống đặt ra:</span>
                  {item.situation}
                </div>

                {/* Player actions */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Hành động của 4 người chơi:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.actions.map(act => (
                      <div
                        key={act.playerId}
                        className="text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2"
                      >
                        <span className="font-bold text-amber-300 flex-shrink-0">{act.playerId}:</span>
                        <div className="min-w-0">
                          <span className="text-slate-400 font-medium">({act.role}) </span>
                          <span className="text-slate-200">"{act.actionText}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* D20 rolls */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Xúc xắc & Đánh giá:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.d20Rolls.map(r => (
                      <span
                        key={r.playerId}
                        className="text-[11px] px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        <strong>{r.playerId}:</strong> D20: <span className="text-amber-400 font-bold">{r.roll}</span>
                        {r.hpChange !== 0 && (
                          <span className={r.hpChange > 0 ? ' text-emerald-400' : ' text-red-400'}>
                            {' '}({r.hpChange > 0 ? `+${r.hpChange}` : r.hpChange} HP)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* GM outcome */}
                <div className="text-xs text-slate-200 bg-slate-900/90 p-3 rounded-lg border-l-2 border-amber-400 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-1">Diễn biến từ Game Master:</span>
                  {item.outcome}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
