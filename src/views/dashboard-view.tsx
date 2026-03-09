import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardCharts } from '@/components/features/dashboard-charts';
import { useWeeklyReports } from '@/hooks/use-weekly-reports';
import { useCategories } from '@/hooks/use-categories';
import { getISOWeekNumber, getISOWeekYearNumber } from '@/lib/utils';
import { BarChart3, FileText, Hash, FolderOpen, Clock } from 'lucide-react';

type FilterPeriod = '4w' | '12w' | 'year';

export default function DashboardView() {
  const [period, setPeriod] = useState<FilterPeriod>('12w');
  const allReports = useWeeklyReports();
  const categories = useCategories();

  const currentYear = getISOWeekYearNumber(new Date());
  const currentWeek = getISOWeekNumber(new Date());

  // Filter reports by period
  const filteredReports = useMemo(() => {
    if (!allReports) return [];

    return allReports.filter((r) => {
      if (r.status !== 'confirmed') return false;

      if (period === '4w') {
        const diff = (currentYear - r.year) * 52 + (currentWeek - r.week);
        return diff >= 0 && diff < 4;
      }
      if (period === '12w') {
        const diff = (currentYear - r.year) * 52 + (currentWeek - r.week);
        return diff >= 0 && diff < 12;
      }
      return r.year === currentYear;
    });
  }, [allReports, period, currentYear, currentWeek]);

  // Stats
  const stats = useMemo(() => {
    if (filteredReports.length === 0) return null;

    const totalItems = filteredReports.reduce((sum, r) => sum + r.items.length, 0);
    const avgItems = filteredReports.length > 0 ? (totalItems / filteredReports.length).toFixed(1) : '0';

    // Most common category
    const catCounts = new Map<string, number>();
    for (const r of filteredReports) {
      for (const item of r.items) {
        catCounts.set(item.categoryId, (catCounts.get(item.categoryId) ?? 0) + 1);
      }
    }

    let topCatId = '';
    let topCount = 0;
    for (const [catId, count] of catCounts) {
      if (count > topCount) {
        topCatId = catId;
        topCount = count;
      }
    }

    const topCat = categories?.find((c) => c.id === topCatId);

    return {
      totalReports: filteredReports.length,
      totalItems,
      topCategory: topCat?.name ?? '-',
      avgItems,
    };
  }, [filteredReports, categories]);

  if (!allReports || !categories) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header title="대시보드">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as FilterPeriod)}
        >
          <option value="4w">최근 4주</option>
          <option value="12w">최근 12주</option>
          <option value="year">올해</option>
        </Select>
      </Header>

      {filteredReports.length < 2 ? (
        <EmptyState
          icon={<BarChart3 size={48} />}
          title="데이터가 부족합니다"
          subtitle="최소 2주 이상의 주간보고를 작성하면 대시보드가 활성화됩니다."
        />
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<FileText size={20} />}
                value={String(stats.totalReports)}
                label="총 보고 수"
              />
              <StatCard
                icon={<Hash size={20} />}
                value={String(stats.totalItems)}
                label="총 항목 수"
              />
              <StatCard
                icon={<FolderOpen size={20} />}
                value={stats.topCategory}
                label="최다 카테고리"
              />
              <StatCard
                icon={<Clock size={20} />}
                value={stats.avgItems}
                label="평균 항목/주"
              />
            </div>
          )}

          {/* Charts */}
          <DashboardCharts reports={filteredReports} categories={categories} />
        </>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="text-accent">{icon}</div>
      <div>
        <div className="text-xl font-bold text-text-primary leading-tight">{value}</div>
        <div className="text-[13px] text-text-muted">{label}</div>
      </div>
    </Card>
  );
}
