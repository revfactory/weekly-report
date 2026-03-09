import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { ReportCard } from '@/components/features/report-card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useWeeklyReports } from '@/hooks/use-weekly-reports';
import { useCategories } from '@/hooks/use-categories';
import { FileText, PenLine, ArrowUpDown } from 'lucide-react';
import { getISOWeekYearNumber } from '@/lib/utils';

export default function ListView() {
  const navigate = useNavigate();
  const currentYear = getISOWeekYearNumber(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [sortAsc, setSortAsc] = useState(false);

  const reports = useWeeklyReports(selectedYear);
  const categories = useCategories();

  const sortedReports = useMemo(() => {
    if (!reports) return [];
    const sorted = [...reports];
    if (sortAsc) sorted.reverse();
    return sorted;
  }, [reports, sortAsc]);

  // Year options: current year and a few years back
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= currentYear - 3; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  if (!reports || !categories) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header title="주간보고 목록">
        <div className="flex items-center gap-2">
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </Select>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSortAsc(!sortAsc)}
            icon={<ArrowUpDown size={14} />}
          >
            {sortAsc ? '오래된순' : '최신순'}
          </Button>
        </div>
      </Header>

      {sortedReports.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="아직 작성된 주간보고가 없습니다"
          subtitle="첫 번째 주간보고를 작성해보세요"
          action={
            <Button
              icon={<PenLine size={16} />}
              onClick={() => navigate('/write')}
            >
              보고 작성하기
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {sortedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
