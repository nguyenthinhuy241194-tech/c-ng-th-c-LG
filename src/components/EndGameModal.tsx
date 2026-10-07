import React from 'react';
import { EndGameSummary, PlayerState } from '../types/game';
import { Trophy, Award, Sparkles, RotateCcw, X, Heart } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EndGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  summary: EndGameSummary | null;
  players: PlayerState[];
  currentTurn: number;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  summary,
  players,
  currentTurn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-5 sm:p-8 text-white flex flex-col max-h-[92vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/40 shadow-lg shadow-amber-500/10">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
            {summary?.finalOutcome || 'Tổng Kết Chiến Dịch Phiêu Lưu'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chuyến phiêu lưu kéo dài {currentTurn} lượt sinh tử cùng Game Master
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Score & MVP Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Điểm Sinh Tồn Nhóm
              </span>
              <span className="text-3xl font-black text-amber-400">
                {summary?.teamScore || 750} <span className="text-sm font-normal text-slate-400">/ 1000</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                MVP Xuất Sắc Nhất
              </span>
              <span className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1.5 mt-1">
                <Award className="w-5 h-5 text-amber-400" />
                {summary?.mvpPlayer || players[0]?.name || 'Chiến binh quả cảm'}
              </span>
            </div>
          </div>

          {/* Epilogue Story */}
          {summary?.epilogue && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Đoạn Kết Sử Thi Của Game Master
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "{summary.epilogue}"
              </p>
            </div>
          )}

          {/* Final Player Status & Individual Titles */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Bảng Vinh Danh 4 Thành Viên:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.avatarIcon}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{p.id}: {p.name}</span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium">
                        {summary?.achievements?.[idx] || `${p.role} kiên cường`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                    {p.hp}/100
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-800 flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Bắt Đầu Ván Mới
          </button>
        </div>
      </div>
    </div>
  );
};
