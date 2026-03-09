import { Textarea } from '@/components/ui/textarea';
import { MAX_REPORT_CONTENT_LENGTH } from '@/lib/constants';

interface ReportEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReportEditor({ value, onChange }: ReportEditorProps) {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`이번 주에 수행한 업무를 자유롭게 작성하세요.\n\n예시:\n- 사용자 인증 모듈 개발 완료\n- 주간 스프린트 미팅 참석\n- 코드 리뷰 3건 수행\n- AWS 비용 최적화 방안 조사`}
        className="min-h-[300px]"
        maxChars={MAX_REPORT_CONTENT_LENGTH}
        showCount
      />
      <p className="mt-1 text-xs text-text-muted">마크다운 형식을 지원합니다.</p>
    </div>
  );
}
