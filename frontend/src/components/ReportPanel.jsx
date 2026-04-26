/**
 * 周报生成/预览/编辑面板
 */
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useStore from '../store/useStore.js';

export default function ReportPanel() {
  const {
    weekReport,
    reportLoading,
    generating,
    records,
    generateReport,
    saveReport,
    showToast,
    currentWeekStart,
  } = useStore();

  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    try {
      await generateReport();
      showToast('周报生成成功！', 'success');
      setEditMode(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleSave() {
    if (!editContent.trim()) {
      showToast('周报内容不能为空', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveReport(editContent);
      showToast('周报保存成功！', 'success');
      setEditMode(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setEditContent(weekReport?.content || '');
    setEditMode(true);
  }

  function handleCopy() {
    const content = weekReport?.content || '';
    navigator.clipboard.writeText(content).then(() => {
      showToast('已复制到剪贴板', 'success');
    }).catch(() => {
      showToast('复制失败，请手动选取', 'error');
    });
  }

  const hasRecords = records.length > 0;

  return (
    <div className="report-panel">
      <div className="report-header">
        <div>
          <h2>AI 周报生成</h2>
          <p className="report-week">
            {currentWeekStart} 这一周 · 共 {records.length} 条事项
          </p>
        </div>
        <div className="report-header-actions">
          {weekReport && !editMode && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
                data-testid="copy-report-btn"
              >
                📋 复制
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleEdit}
                data-testid="edit-report-btn"
              >
                ✏️ 编辑
              </button>
            </>
          )}
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating || !hasRecords}
            data-testid="generate-report-btn"
          >
            {generating ? (
              <>
                <span className="spinner" />
                <span>AI 生成中...</span>
              </>
            ) : (
              <>🤖 {weekReport ? '重新生成' : 'AI 生成周报'}</>
            )}
          </button>
        </div>
      </div>

      {!hasRecords && (
        <div className="card empty-state">
          <div className="empty-icon">📭</div>
          <p>本周暂无工作事项</p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            请先在「本周事项」页签添加工作内容
          </p>
        </div>
      )}

      {hasRecords && !weekReport && !generating && !reportLoading && (
        <div className="card empty-state">
          <div className="empty-icon">🤖</div>
          <p>点击「AI 生成周报」按钮，一键生成本周工作总结</p>
        </div>
      )}

      {(generating || reportLoading) && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>
            {generating ? 'AI 正在为您生成周报...' : '加载中...'}
          </p>
        </div>
      )}

      {weekReport && !generating && !reportLoading && (
        <div className="card report-content-card">
          {/* 元信息 */}
          <div className="report-meta">
            <span className={`badge ${weekReport.is_ai ? 'badge-ai' : 'badge-manual'}`}>
              {weekReport.is_ai ? '🤖 AI 生成' : '✍️ 手动编辑'}
            </span>
            <span className="report-time">
              更新于 {weekReport.updated_at?.slice(0, 16) || '—'}
            </span>
          </div>

          {/* 编辑模式 */}
          {editMode ? (
            <div className="report-edit">
              <textarea
                className="textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ minHeight: 360, fontFamily: 'monospace', fontSize: 13 }}
                data-testid="report-edit-textarea"
              />
              <div className="edit-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                  data-testid="save-report-btn"
                >
                  {saving ? <span className="spinner" /> : '💾 保存周报'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            /* 预览模式 */
            <div
              className="markdown-body report-preview"
              data-testid="report-preview"
            >
              <ReactMarkdown>{weekReport.content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <style>{`
        .report-panel {}
        .report-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .report-header h2 { font-size: 18px; }
        .report-week { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
        .report-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .report-content-card { padding: 24px; }
        .report-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .report-time { font-size: 12px; color: var(--text-muted); }
        .report-preview { line-height: 1.7; }
        .report-edit {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .edit-actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
