import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { downloadMarkdown, downloadPdf } from '@/lib/export';
import { Download, ChevronDown, FileText, File } from 'lucide-react';
import type { WeeklyReport, Category } from '@/types';
import { formatWeekLabel } from '@/lib/utils';

interface ReportExportProps {
  report: WeeklyReport;
  categories: Category[];
}

export function ReportExport({ report, categories }: ReportExportProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const buildMarkdown = (): string => {
    const lines: string[] = [];
    const label = formatWeekLabel(report.year, report.week);
    lines.push(`# 주간보고 ${label}`);
    lines.push('');

    // Group by category
    const groups = new Map<string, typeof report.items>();
    for (const item of report.items) {
      const catId = item.categoryId;
      if (!groups.has(catId)) groups.set(catId, []);
      groups.get(catId)!.push(item);
    }

    for (const [catId, items] of groups) {
      const cat = categoryMap.get(catId);
      lines.push(`## ${cat?.name ?? '기타'}`);
      for (const item of items) {
        const timeStr = item.timeSpent ? ` (${item.timeSpent}시간)` : '';
        lines.push(`- ${item.content}${timeStr}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  };

  const handleMarkdown = () => {
    const md = buildMarkdown();
    downloadMarkdown(md, `주간보고-W${report.week}.md`);
    setOpen(false);
  };

  const handlePdf = async () => {
    const md = buildMarkdown();
    await downloadPdf(md, `주간보고-W${report.week}.pdf`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        size="sm"
        variant="secondary"
        icon={<Download size={14} />}
        onClick={() => setOpen(!open)}
      >
        내보내기
        <ChevronDown size={12} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-background py-1 shadow-lg">
          <button
            onClick={handleMarkdown}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <FileText size={14} />
            마크다운 다운로드
          </button>
          <button
            onClick={handlePdf}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <File size={14} />
            PDF 다운로드
          </button>
        </div>
      )}
    </div>
  );
}
