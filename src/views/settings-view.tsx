import { useState, useRef, useMemo, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/modal';
import { CategoryManager } from '@/components/features/category-manager';
import { useCategories } from '@/hooks/use-categories';
import { useUIStore } from '@/stores/ui-store';
import { testApiConnection } from '@/services/ai-classifier';
import { exportAllData, importData, clearAllData } from '@/lib/export';
import { seedDefaultCategories } from '@/db/seed';
import {
  getActiveProvider,
  setActiveProvider,
  getActiveModel,
  setActiveModel,
  getApiKey,
  setApiKey as saveApiKey,
} from '@/lib/ai-config';
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_MODELS,
  AI_PROVIDER_KEY_PLACEHOLDERS,
} from '@/lib/constants';
import type { AIProviderType } from '@/types';
import {
  Eye, EyeOff, Zap, Download, Upload, Trash2, CheckCircle, XCircle,
  KeyRound, Pencil, X, Save, Info,
} from 'lucide-react';

const PROVIDERS: AIProviderType[] = ['anthropic', 'openai', 'gemini'];

export default function SettingsView() {
  const addToast = useUIStore((s) => s.addToast);
  const categories = useCategories();

  // 영역 1: 활성 프로바이더/모델 (즉시 반영)
  const [activeProviderState, setActiveProviderState] = useState<AIProviderType>(getActiveProvider);
  const [activeModelState, setActiveModelState] = useState(getActiveModel);

  // 영역 2: 키 편집 상태
  const [editingProvider, setEditingProvider] = useState<AIProviderType | null>(null);
  const [editKey, setEditKey] = useState('');
  const [showEditKey, setShowEditKey] = useState(false);
  const [testingProvider, setTestingProvider] = useState<AIProviderType | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [keyVersion, setKeyVersion] = useState(0); // force re-render on key save

  // Data management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 키 등록 상태 (모든 프로바이더)
  const keyStatuses = useMemo(() => ({
    anthropic: !!getApiKey('anthropic'),
    openai: !!getApiKey('openai'),
    gemini: !!getApiKey('gemini'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [keyVersion]);

  // 영역 1 핸들러: 프로바이더 변경 (즉시 반영)
  const handleProviderChange = useCallback((p: AIProviderType) => {
    setActiveProviderState(p);
    setActiveProvider(p);
    const newModel = AI_PROVIDER_MODELS[p].find((m) => m.default)?.id ?? AI_PROVIDER_MODELS[p][0].id;
    setActiveModelState(newModel);
  }, []);

  // 영역 1 핸들러: 모델 변경 (즉시 반영)
  const handleModelChange = useCallback((modelId: string) => {
    setActiveModelState(modelId);
    setActiveModel(modelId);
  }, []);

  // 영역 2 핸들러: 키 편집 시작
  const handleStartEdit = useCallback((p: AIProviderType) => {
    setEditingProvider(p);
    setEditKey(getApiKey(p));
    setShowEditKey(false);
    setTestResults((prev) => ({ ...prev, [p]: null }));
  }, []);

  // 영역 2 핸들러: 키 저장
  const handleSaveKey = useCallback((p: AIProviderType) => {
    saveApiKey(p, editKey);
    // 활성 프로바이더에 키가 없으면 이 프로바이더로 자동 전환
    if (editKey.trim() && !getApiKey(activeProviderState)) {
      setActiveProviderState(p);
      setActiveProvider(p);
      const newModel = AI_PROVIDER_MODELS[p].find((m) => m.default)?.id ?? AI_PROVIDER_MODELS[p][0].id;
      setActiveModelState(newModel);
      addToast('success', `${AI_PROVIDER_LABELS[p]} API 키 저장 및 활성 프로바이더로 전환되었습니다.`);
    } else {
      addToast('success', `${AI_PROVIDER_LABELS[p]} API 키가 저장되었습니다.`);
    }
    setEditingProvider(null);
    setEditKey('');
    setKeyVersion((v) => v + 1);
  }, [editKey, activeProviderState, addToast]);

  // 영역 2 핸들러: 키 편집 취소
  const handleCancelEdit = useCallback(() => {
    setEditingProvider(null);
    setEditKey('');
    setShowEditKey(false);
  }, []);

  // 영역 2 핸들러: 연결 테스트
  const handleTest = useCallback(async (p: AIProviderType) => {
    const key = editingProvider === p ? editKey.trim() : getApiKey(p);
    if (!key) {
      addToast('warning', 'API 키를 먼저 입력해주세요.');
      return;
    }

    const modelForTest = activeProviderState === p
      ? activeModelState
      : AI_PROVIDER_MODELS[p].find((m) => m.default)?.id ?? AI_PROVIDER_MODELS[p][0].id;

    setTestingProvider(p);
    setTestResults((prev) => ({ ...prev, [p]: null }));
    try {
      const result = await testApiConnection({ provider: p, model: modelForTest, apiKey: key });
      setTestResults((prev) => ({ ...prev, [p]: result }));
      if (result) {
        addToast('success', `${AI_PROVIDER_LABELS[p]} 연결 성공!`);
      } else {
        addToast('error', `${AI_PROVIDER_LABELS[p]} API 키가 유효하지 않습니다.`);
      }
    } catch {
      setTestResults((prev) => ({ ...prev, [p]: false }));
      addToast('error', '연결 테스트에 실패했습니다.');
    } finally {
      setTestingProvider(null);
    }
  }, [editingProvider, editKey, activeProviderState, activeModelState, addToast]);

  // Data handlers
  const handleExport = async () => {
    try {
      await exportAllData();
      addToast('success', '데이터가 내보내기되었습니다.');
    } catch {
      addToast('error', '데이터 내보내기에 실패했습니다.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const result = await importData(file);
      addToast('success', `가져오기 완료: 카테고리 ${result.categories}개, 보고 ${result.reports}개, 리포트 ${result.generated}개`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : '데이터 가져오기에 실패했습니다.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      await seedDefaultCategories();
      addToast('success', '모든 데이터가 삭제되었습니다. 기본 카테고리가 복원되었습니다.');
    } catch {
      addToast('error', '데이터 삭제에 실패했습니다.');
    }
  };

  const models = AI_PROVIDER_MODELS[activeProviderState];

  return (
    <div>
      <Header title="설정" />

      {/* 영역 1: 사용할 프로바이더 */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">사용할 프로바이더</h3>

        {/* 라디오 버튼 그룹 */}
        <div className="flex gap-3 mb-4">
          {PROVIDERS.map((p) => (
            <label
              key={p}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                activeProviderState === p
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-border hover:border-text-muted'
              }`}
            >
              <input
                type="radio"
                name="ai-provider"
                checked={activeProviderState === p}
                onChange={() => handleProviderChange(p)}
                className="accent-accent w-4 h-4"
              />
              <span className={`text-sm font-medium ${
                activeProviderState === p ? 'text-accent' : 'text-text-primary'
              }`}>
                {AI_PROVIDER_LABELS[p]}
              </span>
              {keyStatuses[p] ? (
                <span className="w-2 h-2 rounded-full bg-success" title="키 등록됨" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-text-muted/30" title="키 미등록" />
              )}
            </label>
          ))}
        </div>

        {/* 모델 라디오 카드 */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">모델</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {models.map((m) => (
              <label
                key={m.id}
                className={`relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  activeModelState === m.id
                    ? 'border-accent bg-accent/5 shadow-sm'
                    : 'border-border hover:border-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="ai-model"
                  checked={activeModelState === m.id}
                  onChange={() => handleModelChange(m.id)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  activeModelState === m.id ? 'text-accent' : 'text-text-primary'
                }`}>
                  {m.name}
                </span>
                {m.tag && (
                  <span className="text-[11px] text-text-muted">{m.tag}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* 영역 2: API 키 관리 */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">API 키 관리</h3>

        <div className="divide-y divide-border">
          {PROVIDERS.map((p) => {
            const hasKey = keyStatuses[p];
            const isEditing = editingProvider === p;
            const isTesting = testingProvider === p;
            const testResult = testResults[p] ?? null;

            return (
              <div key={p} className="py-3 first:pt-0 last:pb-0">
                {/* 프로바이더 행 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <KeyRound size={16} className="text-text-muted" />
                    <span className="text-sm font-medium text-text-primary">
                      {AI_PROVIDER_LABELS[p]}
                    </span>
                    {hasKey ? (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        등록됨
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40" />
                        미등록
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<X size={14} />}
                        onClick={handleCancelEdit}
                      >
                        취소
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Pencil size={13} />}
                          onClick={() => handleStartEdit(p)}
                        >
                          {hasKey ? '키 변경' : '키 등록'}
                        </Button>
                        {hasKey && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Zap size={13} />}
                            onClick={() => handleTest(p)}
                            loading={isTesting}
                          >
                            테스트
                          </Button>
                        )}
                      </>
                    )}

                    {/* 테스트 결과 (편집 중이 아닐 때만 행 내 표시) */}
                    {!isEditing && testResult !== null && (
                      <span className="flex items-center gap-1 text-xs ml-1">
                        {testResult ? (
                          <CheckCircle size={14} className="text-success" />
                        ) : (
                          <XCircle size={14} className="text-danger" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* 인라인 키 편집 (확장) */}
                {isEditing && (
                  <div className="mt-3 ml-7 space-y-2.5">
                    <Input
                      type={showEditKey ? 'text' : 'password'}
                      value={editKey}
                      onChange={(e) => {
                        setEditKey(e.target.value);
                        setTestResults((prev) => ({ ...prev, [p]: null }));
                      }}
                      placeholder={AI_PROVIDER_KEY_PLACEHOLDERS[p]}
                      rightElement={
                        <button
                          onClick={() => setShowEditKey(!showEditKey)}
                          className="text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          {showEditKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        icon={<Save size={13} />}
                        onClick={() => handleSaveKey(p)}
                      >
                        저장
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Zap size={13} />}
                        onClick={() => handleTest(p)}
                        loading={isTesting}
                      >
                        연결 테스트
                      </Button>
                      {testResult !== null && (
                        <span className="flex items-center gap-1 text-sm">
                          {testResult ? (
                            <>
                              <CheckCircle size={14} className="text-success" />
                              <span className="text-success text-xs">연결 성공</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="text-danger" />
                              <span className="text-danger text-xs">연결 실패</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 mt-4 text-xs text-text-muted">
          <Info size={12} />
          API 키는 브라우저 로컬 스토리지에만 저장됩니다.
        </p>
      </Card>

      {/* Category Management */}
      <Card className="p-6 mb-6">
        {categories ? (
          <CategoryManager categories={categories} />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        )}
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">데이터 관리</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Download size={14} />} onClick={handleExport} size="sm">
            데이터 내보내기
          </Button>
          <Button variant="secondary" icon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()} loading={importing} size="sm">
            데이터 가져오기
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteDialogOpen(true)} size="sm">
            모든 데이터 삭제
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleClearAll}
        title="모든 데이터 삭제"
        description="모든 주간보고, 리포트, 카테고리가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 먼저 데이터를 내보내기하시는 것을 권장합니다."
        confirmLabel="전체 삭제"
        danger
      />
    </div>
  );
}
