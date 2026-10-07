import React from 'react';
import { Package, Plus, X, ArrowUpRight } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: string[];
  onUseItem: (itemName: string) => void;
  onAddItem: (itemName: string) => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  inventory,
  onUseItem,
  onAddItem,
}) => {
  const [newItemInput, setNewItemInput] = React.useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemInput.trim()) return;
    soundManager.playClick();
    onAddItem(newItemInput.trim());
    setNewItemInput('');
  };

  const getItemIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('thuốc') || lower.includes('cứu') || lower.includes('băng')) return '🩹';
    if (lower.includes('đèn') || lower.includes('đuốc') || lower.includes('nến')) return '🔦';
    if (lower.includes('khóa') || lower.includes('chìa')) return '🔑';
    if (lower.includes('bản đồ') || lower.includes('nhật ký') || lower.includes('sách')) return '📜';
    if (lower.includes('vũ khí') || lower.includes('súng') || lower.includes('dao') || lower.includes('kiếm')) return '⚔️';
    if (lower.includes('dây') || lower.includes('móc')) return '🪢';
    if (lower.includes('nước') || lower.includes('bình')) return '🧪';
    return '🎒';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold">Kho Tài Nguyên & Vật Phẩm Nhóm</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 flex-1 overflow-y-auto space-y-2">
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Túi đồ hiện đang trống rỗng. Hãy khám phá thế giới để tìm thêm vật phẩm!
            </div>
          ) : (
            inventory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getItemIcon(item)}</span>
                  <div>
                    <h5 className="font-semibold text-sm text-slate-100">{item}</h5>
                    <p className="text-[11px] text-slate-400">Vật phẩm nhóm có thể dùng trong lượt</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onUseItem(item);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Dùng <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add item manually if needed */}
        <form onSubmit={handleAdd} className="pt-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={newItemInput}
            onChange={e => setNewItemInput(e.target.value)}
            placeholder="Thêm vật phẩm mới (nếu nhặt được)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </form>
      </div>
    </div>
  );
};
