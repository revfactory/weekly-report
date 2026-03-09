import { format } from 'date-fns';
import { db } from '@/db';

function todayStamp(): string {
  return format(new Date(), 'yyyyMMdd');
}

export function downloadMarkdown(content: string, filename?: string): void {
  const name = filename ?? `weekpulse-report-${todayStamp()}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, name.endsWith('.md') ? name : `${name}.md`);
}

/**
 * 마크다운 문자열을 HTML로 변환하여 PDF로 다운로드합니다.
 */
export async function downloadPdf(content: string, filename?: string): Promise<void> {
  const name = filename ?? `weekpulse-report-${todayStamp()}.pdf`;
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default ?? html2pdfModule;

  const html = markdownToHtml(content);

  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.fontFamily = 'Pretendard, -apple-system, sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.8';
  container.style.padding = '20px';
  container.style.color = '#111827';

  const opt = {
    margin: 15,
    filename: name.endsWith('.pdf') ? name : `${name}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };

  await html2pdf().set(opt).from(container).save();
}

/**
 * HTML 요소를 직접 PDF로 변환하여 다운로드합니다.
 */
export async function downloadPDF(element: HTMLElement, filename?: string): Promise<void> {
  const name = filename ?? `weekpulse-report-${todayStamp()}.pdf`;
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default ?? html2pdfModule;

  await html2pdf()
    .set({
      margin: 15,
      filename: name.endsWith('.pdf') ? name : `${name}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    })
    .from(element)
    .save();
}

export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

export async function exportAllData(): Promise<void> {
  const categories = await db.categories.toArray();
  const weeklyReports = await db.weeklyReports.toArray();
  const generatedReports = await db.generatedReports.toArray();

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    weeklyReports,
    generatedReports,
  };

  downloadJson(data, `weekpulse-backup-${todayStamp()}.json`);
}

export async function importData(file: File): Promise<{ categories: number; reports: number; generated: number }> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.version || !data.categories || !data.weeklyReports) {
    throw new Error('유효하지 않은 백업 파일입니다.');
  }

  // Clear existing data
  await db.categories.clear();
  await db.weeklyReports.clear();
  await db.generatedReports.clear();

  // Restore dates
  const categories = data.categories.map((c: Record<string, unknown>) => ({
    ...c,
    createdAt: new Date(c.createdAt as string),
  }));

  const weeklyReports = data.weeklyReports.map((r: Record<string, unknown>) => ({
    ...r,
    weekStart: new Date(r.weekStart as string),
    weekEnd: new Date(r.weekEnd as string),
    createdAt: new Date(r.createdAt as string),
    updatedAt: new Date(r.updatedAt as string),
  }));

  const generatedReports = (data.generatedReports || []).map((r: Record<string, unknown>) => ({
    ...r,
    createdAt: new Date(r.createdAt as string),
    updatedAt: new Date(r.updatedAt as string),
  }));

  await db.categories.bulkAdd(categories);
  await db.weeklyReports.bulkAdd(weeklyReports);
  if (generatedReports.length > 0) {
    await db.generatedReports.bulkAdd(generatedReports);
  }

  return {
    categories: categories.length,
    reports: weeklyReports.length,
    generated: generatedReports.length,
  };
}

export async function clearAllData(): Promise<void> {
  await db.categories.clear();
  await db.weeklyReports.clear();
  await db.generatedReports.clear();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;margin:16px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:20px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;margin:24px 0 12px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:20px">$1</li>')
    .replace(/\n/g, '<br/>');
}
