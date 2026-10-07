import React, { useState } from 'react';
import { GAME_PRESETS } from '../utils/presets';
import { GamePreset, PlayerState } from '../types/game';
import { Sparkles, Compass, Users, Check, Edit3 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SetupModalProps {
  isOpen: boolean;
  onStartGame: (
    preset: {
      world: string;
      goal: string;
      players: PlayerState[];
      initialInventory: string[];
      initialTime: string;
    }
  ) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onStartGame }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('spaceship');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Custom states
  const [customWorld, setCustomWorld] = useState('Trạm nghiên cứu Bắc Cực ngầm bị quái vật ngoài hành tinh tấn công.');
  const [customGoal, setCustomGoal] = useState('Kích hoạt máy phát điện phụ, gửi tín hiệu SOS và thủ vững đến khi trực thăng tới.');

  const [playersData, setPlayersData] = useState<PlayerState[]>(
    GAME_PRESETS[0].defaultPlayers.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      avatarIcon: p.avatarIcon,
      hp: 100,
      maxHp: 100,
      status: 'Khỏe mạnh',
    }))
  );

  if (!isOpen) return null;

  const handleSelectPreset = (preset: GamePreset) => {
    soundManager.playClick();
    setSelectedPresetId(preset.id);
    setIsCustom(false);
    setPlayersData(
      preset.defaultPlayers.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        avatarIcon: p.avatarIcon,
        hp: 100,
        maxHp: 100,
        status: 'Khỏe mạnh',
      }))
    );
  };

  const handleStart = () => {
    soundManager.playTurnStart();
    if (isCustom) {
      onStartGame({
        world: customWorld,
        goal: customGoal,
        players: playersData,
        initialInventory: ['Đèn pin siêu sáng', 'Hộp cứu thương mini', 'Bộ đàm cự ly xa', 'Dụng cụ đa năng'],
        initialTime: '00:00 | Khởi đầu thử thách',
      });
    } else {
      const preset = GAME_PRESETS.find(p => p.id === selectedPresetId) || GAME_PRESETS[0];
      onStartGame({
        world: preset.world,
        goal: preset.goal,
        players: playersData,
        initialInventory: preset.defaultInventory,
        initialTime: preset.initialTime,
      });
    }
  };

  const updatePlayer = (index: number, field: 'name' | 'role' | 'avatarIcon', value: string) => {
    setPlayersData(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-8 text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Khởi Tạo Chiến Dịch Game Master 4P
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Chọn chủ đề phiêu lưu kịch tính hoặc tự do thiết lập thế giới và 4 người chơi
            </p>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4" /> 1. Chọn Thế Giới & Bối Cảnh Phiêu Lưu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GAME_PRESETS.map(preset => {
                const isSelected = !isCustom && selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-4 rounded-xl border transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-slate-800/90 ring-2 ring-amber-400/40 shadow-lg'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl select-none">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-white truncate">{preset.title}</h4>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-amber-300/80 font-medium mt-0.5">{preset.tagline}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">{preset.world}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom World button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsCustom(true);
              }}
              className={`mt-3 w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isCustom
                  ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/40 shadow-lg'
                  : 'border-dashed border-slate-700 bg-slate-850/50 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✍️</span>
                <div>
                  <div className="font-semibold text-sm text-white">Tự Do Sáng Tạo Thế Giới & Mục Tiêu Riêng</div>
                  <div className="text-xs text-slate-400">Tự nhập bối cảnh bất kỳ (Tận thế zombie, Đột nhập mật vụ, v.v.)</div>
                </div>
              </div>
              {isCustom && <Check className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          {/* Custom Form if isCustom */}
          {isCustom && (
            <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Thế giới trò chơi (Mô tả bối cảnh):</label>
                <textarea
                  value={customWorld}
                  onChange={e => setCustomWorld(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="Ví dụ: Tàu ngầm bị đắm dưới đáy vực sâu 4000m..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mục tiêu của nhóm:</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={e => setCustomGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="Ví dụ: Sửa bánh lái và nổi lên mặt nước trước khi áp suất phá hủy khoang..."
                />
              </div>
            </div>
          )}

          {/* 4 Players Setup */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> 2. Thiết Lập 4 Người Chơi (P1, P2, P3, P4)
              </label>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Có thể chỉnh sửa tên & nghề nghiệp
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playersData.map((player, idx) => (
                <div
                  key={player.id}
                  className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl relative group hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {player.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{player.avatarIcon}</span>
                      <span className="text-xs text-slate-400">100 HP</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Tên người chơi:</label>
                      <input
                        type="text"
                        value={player.name}
                        onChange={e => updatePlayer(idx, 'name', e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Vai trò / Kỹ năng:</label>
                      <input
                        type="text"
                        value={player.role}
                        onChange={e => updatePlayer(idx, 'role', e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 hidden sm:block">
            Mỗi người chơi có 100 HP ban đầu • GM tung xúc xắc D20 theo từng quyết định
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Bắt Đầu Chuyến Phiêu Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
