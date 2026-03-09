import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { ReportEditor } from '@/components/features/report-editor';
import { ClassificationResult } from '@/components/features/classification-result';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { useCategories } from '@/hooks/use-categories';
import { useWeeklyReport, useWeeklyReportByWeek } from '@/hooks/use-weekly-reports';
import { useClassify } from '@/hooks/use-ai';
import { useUIStore } from '@/stores/ui-store';
import { db } from '@/db';
import { nanoid } from 'nanoid';
import {
  getISOWeekNumber,
  getISOWeekYearNumber,
  getWeekRange,
  formatWeekLabel,
} from '@/lib/utils';
import { getActiveConfig } from '@/lib/ai-config';
import { Sparkles, Save, AlertTriangle } from 'lucide-react';
import type { ReportItem, WeeklyReport } from '@/types';

export default function WriteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const categories = useCategories();
  const existingReport = useWeeklyReport(id);

  // Week selector
  const now = new Date();
  const currentYear = getISOWeekYearNumber(now);
  const currentWeek = getISOWeekNumber(now);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [rawContent, setRawContent] = useState('');
  const [items, setItems] = useState<ReportItem[]>([]);
  const [showClassification, setShowClassification] = useState(false);
  const [saving, setSaving] = useState(false);

  const { classify, isLoading: classifying } = useClassify();

  // Check for existing report for selected week (when not editing by ID)
  const existingForWeek = useWeeklyReportByWeek(selectedYear, selectedWeek);

  const hasApiKey = !!getActiveConfig().apiKey;

  // Edit mode: by URL param or existing report for selected week
  const isEditMode = (!!id && !!existingReport) || !!existingForWeek;
  const activeReport = existingReport || existingForWeek;

  useEffect(() => {
    if (existingReport) {
      setRawContent(existingReport.rawContent);
      setSelectedYear(existingReport.year);
      setSelectedWeek(existingReport.week);
      if (existingReport.items.length > 0) {
        setItems(existingReport.items);
        setShowClassification(true);
      }
    }
  }, [existingReport]);

  // When week changes, reset form or load existing report for that week
  useEffect(() => {
    if (id) return; // skip if editing by ID
    if (existingForWeek) {
      setRawContent(existingForWeek.rawContent);
      if (existingForWeek.items.length > 0) {
        setItems(existingForWeek.items);
        setShowClassification(true);
      } else {
        setItems([]);
        setShowClassification(false);
      }
    } else {
      setRawContent('');
      setItems([]);
      setShowClassification(false);
    }
  }, [existingForWeek, id, selectedYear, selectedWeek]);

  // Generate week options (current year, all 52 weeks)
  const weekOptions = useMemo(() => {
    const options = [];
    for (let w = 1; w <= 52; w++) {
      options.push({
        value: w,
        label: `${selectedYear}년 ${formatWeekLabel(selectedYear, w)}`,
      });
    }
    return options;
  }, [selectedYear]);

  const handleClassify = async () => {
    if (!rawContent.trim()) {
      addToast('warning', '내용을 입력해주세요.');
      return;
    }
    if (!hasApiKey) {
      addToast('error', 'API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.');
      return;
    }
    if (!categories) return;

    try {
      const result = await classify(
        rawContent,
        categories.map((c) => ({ id: c.id, name: c.name })),
      );
      setItems(result);
      setShowClassification(true);
      addToast('success', `${result.length}개 항목이 분류되었습니다.`);
    } catch {
      addToast('error', 'AI 분류에 실패했습니다. 수동으로 분류하거나 다시 시도해주세요.');
    }
  };

  const handleDraftSave = async () => {
    if (!rawContent.trim()) {
      addToast('warning', '내용을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const { start, end } = getWeekRange(selectedYear, selectedWeek);
      const now = new Date();

      if (isEditMode && activeReport) {
        await db.weeklyReports.update(activeReport.id, {
          rawContent,
          items,
          updatedAt: now,
        });
        addToast('success', '임시 저장되었습니다.');
      } else {
        const report: WeeklyReport = {
          id: nanoid(),
          year: selectedYear,
          week: selectedWeek,
          weekStart: start,
          weekEnd: end,
          rawContent,
          items: [],
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        };
        await db.weeklyReports.add(report);
        addToast('success', '임시 저장되었습니다.');
        navigate(`/write/${report.id}`, { replace: true });
      }
    } catch (err) {
      addToast('error', '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSave = async () => {
    if (items.length === 0) {
      addToast('warning', '분류된 항목이 없습니다.');
      return;
    }

    setSaving(true);
    try {
      const { start, end } = getWeekRange(selectedYear, selectedWeek);
      const now = new Date();

      if (isEditMode && activeReport) {
        await db.weeklyReports.update(activeReport.id, {
          rawContent,
          items,
          status: 'confirmed',
          updatedAt: now,
        });
        addToast('success', '주간보고가 저장되었습니다.');
        navigate('/list');
      } else {
        const report: WeeklyReport = {
          id: nanoid(),
          year: selectedYear,
          week: selectedWeek,
          weekStart: start,
          weekEnd: end,
          rawContent,
          items,
          status: 'confirmed',
          createdAt: now,
          updatedAt: now,
        };
        await db.weeklyReports.add(report);
        addToast('success', '주간보고가 저장되었습니다.');
        navigate('/list');
      }
    } catch (err) {
      addToast('error', '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="주간보고 작성">
        <div className="flex items-center gap-2">
          {isEditMode && <Badge color="#F59E0B">수정 모드</Badge>}
          <Select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            disabled={false}
          >
            {weekOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </Header>

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle size={16} />
          <span>
            API 키가 설정되지 않았습니다.{' '}
            <Link to="/settings" className="underline font-medium">
              설정 페이지
            </Link>
            에서 API 키를 입력해주세요.
          </span>
        </div>
      )}

      {/* Editor */}
      <ReportEditor value={rawContent} onChange={setRawContent} />

      {/* Action Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          onClick={handleClassify}
          loading={classifying}
          icon={<Sparkles size={16} />}
          disabled={!rawContent.trim()}
        >
          {classifying ? '분류 중...' : 'AI 분류'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleDraftSave}
          loading={saving}
          icon={<Save size={16} />}
          disabled={!rawContent.trim()}
        >
          임시 저장
        </Button>
      </div>

      {/* Classification Result */}
      {showClassification && categories && (
        <ClassificationResult
          items={items}
          categories={categories}
          onChange={setItems}
          onConfirm={handleConfirmSave}
          loading={saving}
        />
      )}

      {/* Empty state when no content */}
      {!rawContent.trim() && !showClassification && (
        <div className="mt-12">
          <EmptyState
            icon={<Sparkles size={48} />}
            title="업무 내용을 입력하세요"
            subtitle="자유 텍스트로 이번 주 업무를 작성하면 AI가 자동으로 분류합니다."
          />
        </div>
      )}
    </div>
  );
}
