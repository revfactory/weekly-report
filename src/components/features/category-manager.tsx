import { useState } from 'react';
import type { Category } from '@/types';
import { db } from '@/db';
import { nanoid } from 'nanoid';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { CATEGORY_COLOR_PRESETS, MAX_CATEGORY_NAME_LENGTH } from '@/lib/constants';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [editModal, setEditModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const addToast = useUIStore((s) => s.addToast);

  const handleDelete = async (cat: Category) => {
    if (cat.isDefault) {
      addToast('warning', '기본 카테고리는 삭제할 수 없습니다.');
      return;
    }

    // Move items to "기타" category
    const etcCategory = categories.find((c) => c.name === '기타');
    if (etcCategory) {
      const allReports = await db.weeklyReports.toArray();
      for (const report of allReports) {
        const hasCategory = report.items.some((i) => i.categoryId === cat.id);
        if (hasCategory) {
          const updatedItems = report.items.map((i) =>
            i.categoryId === cat.id ? { ...i, categoryId: etcCategory.id } : i,
          );
          await db.weeklyReports.update(report.id, { items: updatedItems });
        }
      }
    }

    await db.categories.delete(cat.id);
    addToast('success', `"${cat.name}" 카테고리가 삭제되었습니다.`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">카테고리 관리</h3>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => setEditModal({ open: true })}
        >
          카테고리 추가
        </Button>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface transition-colors group"
          >
            <GripVertical size={14} className="text-text-muted opacity-0 group-hover:opacity-100 shrink-0" />
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 text-sm text-text-primary">{cat.name}</span>
            {cat.isDefault && (
              <span className="text-xs text-text-muted">기본</span>
            )}
            <button
              onClick={() => setEditModal({ open: true, category: cat })}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <Pencil size={14} />
            </button>
            {!cat.isDefault && (
              <button
                onClick={() => handleDelete(cat)}
                className="text-text-muted hover:text-danger transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <CategoryEditModal
        open={editModal.open}
        category={editModal.category}
        nextOrder={categories.length}
        onClose={() => setEditModal({ open: false })}
      />
    </div>
  );
}

interface CategoryEditModalProps {
  open: boolean;
  category?: Category;
  nextOrder: number;
  onClose: () => void;
}

function CategoryEditModal({ open, category, nextOrder, onClose }: CategoryEditModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLOR_PRESETS[0]);
  const addToast = useUIStore((s) => s.addToast);
  const isEdit = !!category;

  // Reset form when modal opens
  const handleOpen = () => {
    setName(category?.name ?? '');
    setColor(category?.color ?? CATEGORY_COLOR_PRESETS[0]);
  };

  if (open && name === '' && !category) {
    // fresh add
  }

  const handleSave = async () => {
    if (!name.trim()) {
      addToast('warning', '카테고리 이름을 입력해주세요.');
      return;
    }

    if (isEdit && category) {
      await db.categories.update(category.id, { name: name.trim(), color });
      addToast('success', '카테고리가 수정되었습니다.');
    } else {
      await db.categories.add({
        id: nanoid(),
        name: name.trim(),
        color,
        sortOrder: nextOrder,
        isDefault: false,
        createdAt: new Date(),
      });
      addToast('success', '카테고리가 추가되었습니다.');
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '카테고리 수정' : '카테고리 추가'}
    >
      <div className="space-y-4" ref={() => handleOpen()}>
        <Input
          label="카테고리 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          placeholder="예: 개발, 회의, 기획"
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">색상 선택</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setColor(preset)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 cursor-pointer transition-transform',
                  color === preset ? 'border-text-primary scale-110' : 'border-transparent',
                )}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
