import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Header } from '@/components/layout/header';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PeriodReport } from '@/components/features/period-report';
import { useGenerateReport } from '@/hooks/use-ai';
import { useUIStore } from '@/stores/ui-store';
import { db } from '@/db';
import { getISOWeekYearNumber } from '@/lib/utils';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import type { ReportType, GeneratedReport } from '@/types';
import { format } from 'date-fns';

const tabOptions = [
  { label: '월간', value: 'monthly' },
  { label: '분기', value: 'quarterly' },
  { label: '연간', value: 'yearly' },
];

export default function ReportsView() {
  const params = useParams<{ type: string; year: string; period: string }>();
  const addToast = useUIStore((s) => s.addToast);

  const currentYear = getISOWeekYearNumber(new Date());
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  const [activeTab, setActiveTab] = useState<ReportType>(
    (params.type as ReportType) || 'monthly',
  );
  const [selectedYear, setSelectedYear] = useState(
    params.year ? Number(params.year) : currentYear,
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    params.period ? Number(params.period) : activeTab === 'quarterly' ? currentQuarter : currentMonth,
  );
  const [viewingReport, setViewingReport] = useState<GeneratedReport | null>(null);

  const { generate, isLoading } = useGenerateReport();

  // Fetch existing generated reports
  const generatedReports = useLiveQuery(
    () => db.generatedReports.where('year').equals(selectedYear).toArray(),
    [selectedYear],
  );

  // Filter by active tab type
  const filteredGenReports = useMemo(
    () => (generatedReports ?? []).filter((r) => r.type === activeTab),
    [generatedReports, activeTab],
  );

  // Check if report exists for current selection
  const existingReport = useMemo(
    () =>
      filteredGenReports.find(
        (r) => r.year === selectedYear && r.period === selectedPeriod,
      ),
    [filteredGenReports, selectedYear, selectedPeriod],
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as ReportType);
    if (value === 'quarterly') setSelectedPeriod(currentQuarter);
    else if (value === 'monthly') setSelectedPeriod(currentMonth);
    else setSelectedPeriod(0);
    setViewingReport(null);
  };

  const handleGenerate = async () => {
    const period = activeTab === 'yearly' ? 0 : selectedPeriod;
    const result = await generate(activeTab, selectedYear, period);
    if (result) {
      setViewingReport(result);
      addToast('success', '리포트가 생성되었습니다.');
    }
  };

  // Period selector options
  const periodOptions = useMemo(() => {
    if (activeTab === 'monthly') {
      return Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}월`,
      }));
    }
    if (activeTab === 'quarterly') {
      return [
        { value: 1, label: 'Q1 (1~3월)' },
        { value: 2, label: 'Q2 (4~6월)' },
        { value: 3, label: 'Q3 (7~9월)' },
        { value: 4, label: 'Q4 (10~12월)' },
      ];
    }
    return [];
  }, [activeTab]);

  const yearOptions = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const displayReport = viewingReport || existingReport;

  return (
    <div>
      <Header title="리포트" />

      <Tabs tabs={tabOptions} value={activeTab} onChange={handleTabChange} className="mb-6" />

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            setViewingReport(null);
          }}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </Select>

        {activeTab !== 'yearly' && (
          <Select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(Number(e.target.value));
              setViewingReport(null);
            }}
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        )}

        <Button
          onClick={handleGenerate}
          loading={isLoading}
          icon={<Sparkles size={16} />}
        >
          {existingReport ? '재생성' : '리포트 생성'}
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="p-8 flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-accent animate-spin" />
          <p className="text-sm text-text-muted">리포트 생성 중...</p>
          <div className="w-full max-w-md space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 rounded bg-surface animate-pulse"
                style={{ width: `${100 - i * 15}%` }}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Report content */}
      {!isLoading && displayReport && (
        <PeriodReport
          content={displayReport.content}
          title={displayReport.title}
        />
      )}

      {/* Empty state */}
      {!isLoading && !displayReport && (
        <EmptyState
          icon={<FileText size={48} />}
          title="리포트를 생성해주세요"
          subtitle="해당 기간의 주간보고를 기반으로 AI가 종합 리포트를 생성합니다."
        />
      )}

      {/* Previous reports list */}
      {filteredGenReports.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-text-primary mb-3">이전 리포트</h3>
          <div className="space-y-2">
            {filteredGenReports.map((r) => (
              <Card
                key={r.id}
                clickable
                className="p-3 flex items-center justify-between"
                onClick={() => setViewingReport(r)}
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-accent" />
                  <span className="text-sm font-medium text-text-primary">{r.title}</span>
                </div>
                <span className="text-xs text-text-muted">
                  {format(r.createdAt, 'yyyy-MM-dd')}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
