import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/modal';
import { ReportExport } from '@/components/features/report-export';
import { useWeeklyReport } from '@/hooks/use-weekly-reports';
import { useCategories } from '@/hooks/use-categories';
import { useUIStore } from '@/stores/ui-store';
import { db } from '@/db';
import { formatWeekLabel } from '@/lib/utils';
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, IMPORTANCE_COLORS, IMPORTANCE_LABELS } from '@/lib/constants';
import { Pencil, Trash2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const report = useWeeklyReport(id);
  const categories = useCategories();
  const [showRaw, setShowRaw] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const categoryMap = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories],
  );

  // Group items by category
  const groupedItems = useMemo(() => {
    if (!report) return [];
    const groups = new Map<string, typeof report.items>();
    for (const item of report.items) {
      if (!groups.has(item.categoryId)) groups.set(item.categoryId, []);
      groups.get(item.categoryId)!.push(item);
    }
    return Array.from(groups.entries()).map(([catId, items]) => ({
      category: categoryMap.get(catId),
      items,
      totalTime: items.reduce((sum, i) => sum + (i.timeSpent ?? 0), 0),
    }));
  }, [report, categoryMap]);

  // Donut chart data
  const donutData = useMemo(
    () =>
      groupedItems.map((g) => ({
        name: g.category?.name ?? '기타',
        value: g.items.length,
        color: g.category?.color ?? '#9CA3AF',
      })),
    [groupedItems],
  );

  const handleDelete = async () => {
    if (!report) return;
    await db.weeklyReports.delete(report.id);
    addToast('success', '주간보고가 삭제되었습니다.');
    navigate('/list');
  };

  if (!report || !categories) {
    if (!id) {
      return (
        <EmptyState
          icon={<FileText size={48} />}
          title="주간보고를 선택하세요"
          subtitle="목록에서 주간보고를 선택해주세요"
        />
      );
    }
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header title={formatWeekLabel(report.year, report.week)}>
        <div className="flex items-center gap-2">
          <Badge color={REPORT_STATUS_COLORS[report.status]}>
            {REPORT_STATUS_LABELS[report.status]}
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            icon={<Pencil size={14} />}
            onClick={() => navigate(`/write/${report.id}`)}
          >
            수정
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 size={14} />}
            onClick={() => setDeleteOpen(true)}
          >
            삭제
          </Button>
          <ReportExport report={report} categories={categories} />
        </div>
      </Header>

      {/* Raw content collapsible */}
      <button
        onClick={() => setShowRaw(!showRaw)}
        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer mb-4"
      >
        {showRaw ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        원문 보기
      </button>
      {showRaw && (
        <Card className="mb-6 p-4">
          <div className="markdown-content text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report.rawContent}
            </ReactMarkdown>
          </div>
        </Card>
      )}

      {/* Classified items grouped by category */}
      <div className="space-y-4">
        {groupedItems.map(({ category, items, totalTime }) => (
          <Card key={category?.id ?? 'unknown'} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: category?.color ?? '#9CA3AF' }}
              />
              <h3 className="text-base font-semibold text-text-primary">
                {category?.name ?? '기타'}
              </h3>
              <span className="text-xs text-text-muted">{items.length}개</span>
              {totalTime > 0 && (
                <span className="text-xs text-text-muted ml-auto">{totalTime}시간</span>
              )}
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 text-sm text-text-primary"
                >
                  <span className="flex-1">{item.content}</span>
                  <Badge color={IMPORTANCE_COLORS[item.importance]}>
                    {IMPORTANCE_LABELS[item.importance]}
                  </Badge>
                  {item.timeSpent && (
                    <span className="text-xs text-text-muted shrink-0">
                      {item.timeSpent}h
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-text-primary">{report.items.length}</span>
          <span className="text-xs text-text-muted">총 항목 수</span>
        </Card>
        <Card className="p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-text-primary">
            {report.items.reduce((sum, i) => sum + (i.timeSpent ?? 0), 0)}h
          </span>
          <span className="text-xs text-text-muted">총 시간</span>
        </Card>
        <Card className="p-4 flex items-center justify-center">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                dataKey="value"
                paddingAngle={2}
              >
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="주간보고 삭제"
        description="이 주간보고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        danger
      />
    </div>
  );
}
