/**
 * 历史周报列表组件
 */
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getReportHistory, deleteReport } from '../api/reports.js';
import useStore from '../store/useStore.js';

export default function HistoryList() {
  const { showToast } = useStore();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    fetchHistory(page);
  }, [page]);  // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchHistory(p) {
    setLoading(true);
    try {
      const data = await getReportHistory(p, pageSize);
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, weekStart) {
    if (!window.confirm(`确认删除 ${weekStart} 这周的周报？`)) return;
    try {
      await deleteReport(id);
      showToast('周报已删除', 'success');
      fetchHistory(page);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  if (loading && reports.length === 0) {
    return (
      <div className="loading-wrap">
        <span className="spinner" />
        <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>加载中...</span>
      </div>
    );
  }

  return (
    <div className="history-list">
      <div className="history-header">
        <h2>历史周报</h2>
        <span className="total-badge">{total} 份</span>
      </div>

      {reports.length === 0 && !loading && (
        <div className="card empty-state">
          <div className="empty-icon">📂</div>
          <p>暂无历史周报</p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            生成并保存周报后，将在此处显示
          </p>
        </div>
      )}

      {reports.map((report) => {
        const isExpanded = expandedId === report.id;
        // 计算周结束日期
        const weekEnd = new Date(report.week_start);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekEndStr = weekEnd.toISOString().slice(0, 10);

        return (
          <div
            key={report.id}
            className="history-item card"
            data-testid={`history-item-${report.id}`}
          >
            <div className="history-item-header">
              <div className="history-item-meta">
                <span className="history-week">
                  {report.week_start} ~ {weekEndStr}
                </span>
                <span className={`badge ${report.is_ai ? 'badge-ai' : 'badge-manual'}`}>
                  {report.is_ai ? '🤖 AI 生成' : '✍️ 手动'}
                </span>
                <span className="history-time">
                  {report.updated_at?.slice(0, 16)}
                </span>
              </div>
              <div className="history-item-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleExpand(report.id)}
                  data-testid={`expand-report-btn-${report.id}`}
                >
                  {isExpanded ? '⬆ 收起' : '⬇ 展开'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(report.id, report.week_start)}
                  data-testid={`delete-history-btn-${report.id}`}
                >
                  删除
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="history-content">
                <div className="markdown-body">
                  <ReactMarkdown>{report.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1 || loading}
          >
            上一页
          </button>
          <span className="page-info">{page} / {totalPages}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
          >
            下一页
          </button>
        </div>
      )}

      <style>{`
        .history-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .history-header h2 { font-size: 18px; }
        .total-badge {
          background: var(--primary-light);
          color: var(--primary);
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .history-item {
          margin-bottom: 12px;
          padding: 0;
          overflow: hidden;
        }
        .history-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .history-item-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .history-week { font-weight: 600; font-size: 14px; }
        .history-time { font-size: 12px; color: var(--text-muted); }
        .history-item-actions {
          display: flex;
          gap: 8px;
        }
        .history-content {
          padding: 16px;
          border-top: 1px solid var(--border);
          background: #fafafa;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
        }
        .page-info { font-size: 13px; color: var(--text-secondary); }
        .loading-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
