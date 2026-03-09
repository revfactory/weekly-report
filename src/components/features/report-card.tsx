import { useNavigate } from 'react-router-dom';
import type { WeeklyReport, Category } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryTag } from '@/components/features/category-tag';
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '@/lib/constants';
import { formatWeekLabel } from '@/lib/utils';
import { format } from 'date-fns';

interface ReportCardProps {
  report: WeeklyReport;
  categories: Category[];
}

export function ReportCard({ report, categories }: ReportCardProps) {
  const navigate = useNavigate();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Unique categories used in this report
  const usedCategories = Array.from(
    new Set(report.items.map((i) => i.categoryId))
  )
    .map((id) => categoryMap.get(id))
    .filter(Boolean) as Category[];

  const maxTags = 4;
  const visibleTags = usedCategories.slice(0, maxTags);
  const remaining = usedCategories.length - maxTags;

  return (
    <Card
      clickable
      onClick={() => navigate(`/list/${report.id}`)}
      className="p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">
          {formatWeekLabel(report.year, report.week)}
        </h3>
        <Badge color={REPORT_STATUS_COLORS[report.status]}>
          {REPORT_STATUS_LABELS[report.status]}
        </Badge>
      </div>

      {visibleTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {visibleTags.map((cat) => (
            <CategoryTag key={cat.id} name={cat.name} color={cat.color} />
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-text-muted bg-surface">
              +{remaining}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-[13px] text-text-muted">
        <span>{report.items.length}개 항목</span>
        <span>{format(report.createdAt, 'yyyy-MM-dd')}</span>
      </div>
    </Card>
  );
}
