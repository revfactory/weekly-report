import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { downloadMarkdown, downloadPdf } from '@/lib/export';
import { Download, FileText } from 'lucide-react';

interface PeriodReportProps {
  content: string;
  title: string;
}

export function PeriodReport({ content, title }: PeriodReportProps) {
  const handleMarkdownDownload = () => {
    downloadMarkdown(content, `${title}.md`);
  };

  const handlePdfDownload = async () => {
    await downloadPdf(content, `${title}.pdf`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<FileText size={14} />}
            onClick={handleMarkdownDownload}
          >
            마크다운
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={14} />}
            onClick={handlePdfDownload}
          >
            PDF
          </Button>
        </div>
      </div>
      <div className="markdown-content rounded-lg border border-border bg-surface p-6 text-sm text-text-primary leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
