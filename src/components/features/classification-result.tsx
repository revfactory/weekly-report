import { useState } from 'react';
import type { ReportItem, Category, Importance } from '@/types';
import { CategoryTag } from '@/components/features/category-tag';
import { Button } from '@/components/ui/button';
import { IMPORTANCE_COLORS, IMPORTANCE_LABELS } from '@/lib/constants';
import { X, Plus, Check } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';

interface ClassificationResultProps {
  items: ReportItem[];
  categories: Category[];
  onChange: (items: ReportItem[]) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ClassificationResult({
  items,
  categories,
  onChange,
  onConfirm,
  loading,
}: ClassificationResultProps) {
  const updateItem = (id: string, updates: Partial<ReportItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    const defaultCat = categories[categories.length - 1]; // "기타"
    onChange([
      ...items,
      {
        id: nanoid(),
        content: '',
        categoryId: defaultCat?.id ?? '',
        importance: 'medium',
        timeSpent: null,
      },
    ]);
  };

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">분류 결과</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <ClassificationItem
            key={item.id}
            item={item}
            categories={categories}
            onUpdate={(updates) => updateItem(item.id, updates)}
            onRemove={() => removeItem(item.id)}
            delay={index * 50}
          />
        ))}
      </div>
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
      >
        <Plus size={14} />
        항목 추가
      </button>
      <div className="pt-4">
        <Button
          variant="success"
          onClick={onConfirm}
          loading={loading}
          icon={<Check size={16} />}
          className="w-full sm:w-auto"
        >
          확인 및 저장
        </Button>
      </div>
    </div>
  );
}

interface ClassificationItemProps {
  item: ReportItem;
  categories: Category[];
  onUpdate: (updates: Partial<ReportItem>) => void;
  onRemove: () => void;
  delay: number;
}

function ClassificationItem({ item, categories, onUpdate, onRemove, delay }: ClassificationItemProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const currentCategory = categories.find((c) => c.id === item.categoryId);
  const importanceOrder: Importance[] = ['high', 'medium', 'low'];

  const cycleImportance = () => {
    const currentIndex = importanceOrder.indexOf(item.importance);
    const next = importanceOrder[(currentIndex + 1) % 3];
    onUpdate({ importance: next });
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-border bg-surface p-3 animate-stagger-in group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Category tag */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className="cursor-pointer"
        >
          <CategoryTag
            name={currentCategory?.name ?? '미분류'}
            color={currentCategory?.color ?? '#9CA3AF'}
          />
        </button>
        {showCategoryDropdown && (
          <div className="absolute left-0 top-full z-20 mt-1 rounded-lg border border-border bg-background py-1 shadow-lg min-w-[140px]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onUpdate({ categoryId: cat.id });
                  setShowCategoryDropdown(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface transition-colors cursor-pointer',
                  cat.id === item.categoryId && 'bg-surface font-medium',
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <input
        type="text"
        value={item.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        className="flex-1 bg-transparent text-sm text-text-primary outline-none border-none min-w-0"
        placeholder="업무 내용"
      />

      {/* Importance badge */}
      <button
        onClick={cycleImportance}
        className="shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors"
        style={{
          backgroundColor: `${IMPORTANCE_COLORS[item.importance]}20`,
          color: IMPORTANCE_COLORS[item.importance],
        }}
      >
        {IMPORTANCE_LABELS[item.importance]}
      </button>

      {/* Time spent */}
      <div className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          value={item.timeSpent ?? ''}
          onChange={(e) =>
            onUpdate({
              timeSpent: e.target.value ? Number(e.target.value) : null,
            })
          }
          placeholder="0"
          min={0}
          step={0.5}
          className="w-14 h-7 rounded border border-border bg-background px-2 text-xs text-text-primary text-center outline-none focus:ring-1 focus:ring-accent/40"
        />
        <span className="text-xs text-text-muted">시간</span>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="shrink-0 text-text-muted hover:text-danger transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
