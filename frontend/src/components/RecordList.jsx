/**
 * 事项列表组件
 * 支持按天分组展示、添加、编辑、删除事项
 */
import React, { useState } from 'react';
import dayjs from 'dayjs';
import useStore from '../store/useStore.js';

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** 生成当前周的 7 天日期列表 */
function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) =>
    dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD')
  );
}

export default function RecordList() {
  const { records, recordsLoading, currentWeekStart, addRecord, updateRecord, removeRecord, showToast } = useStore();

  const [addingDate, setAddingDate] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const weekDays = getWeekDays(currentWeekStart);

  // 按日期分组
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  async function handleAdd(date) {
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      await addRecord({ date, content: newContent.trim() });
      setNewContent('');
      setAddingDate(null);
      showToast('事项添加成功', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id) {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await updateRecord(id, editContent.trim());
      setEditingId(null);
      setEditContent('');
      showToast('事项更新成功', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('确认删除此事项？')) return;
    try {
      await removeRecord(id);
      showToast('事项已删除', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (recordsLoading) {
    return (
      <div className="loading-wrap">
        <span className="spinner" />
        <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>加载中...</span>
      </div>
    );
  }

  const totalCount = records.length;

  return (
    <div className="record-list">
      <div className="record-list-header">
        <h2>本周事项</h2>
        <span className="total-badge">{totalCount} 条</span>
      </div>

      {weekDays.map((date) => {
        const dayOfWeek = DAY_NAMES[dayjs(date).day()];
        const isToday = date === dayjs().format('YYYY-MM-DD');
        const dayRecords = grouped[date] || [];
        const isAdding = addingDate === date;

        return (
          <div key={date} className={`day-block ${isToday ? 'today' : ''}`} data-testid={`day-block-${date}`}>
            <div className="day-header">
              <span className="day-label">
                <span className="day-name">{dayOfWeek}</span>
                <span className="day-date">{date}</span>
                {isToday && <span className="today-badge">今天</span>}
              </span>
              <button
                className="btn btn-ghost btn-sm add-btn"
                onClick={() => {
                  setAddingDate(isAdding ? null : date);
                  setNewContent('');
                }}
                data-testid={`add-record-btn-${date}`}
              >
                {isAdding ? '✕ 取消' : '+ 添加'}
              </button>
            </div>

            {/* 事项列表 */}
            {dayRecords.length > 0 && (
              <ul className="records-ul">
                {dayRecords.map((record) => (
                  <li key={record.id} className="record-item" data-testid={`record-item-${record.id}`}>
                    {editingId === record.id ? (
                      <div className="record-edit">
                        <input
                          className="input"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(record.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          data-testid={`edit-input-${record.id}`}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdate(record.id)}
                          disabled={submitting}
                        >
                          保存
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingId(null)}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="record-view">
                        <span className="record-content" data-testid={`record-content-${record.id}`}>
                          {record.content}
                        </span>
                        <div className="record-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setEditingId(record.id);
                              setEditContent(record.content);
                            }}
                            data-testid={`edit-record-btn-${record.id}`}
                            title="编辑"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(record.id)}
                            data-testid={`delete-record-btn-${record.id}`}
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* 添加表单 */}
            {isAdding && (
              <div className="add-form" data-testid="add-record-form">
                <input
                  className="input"
                  placeholder="输入事项内容（最多 500 字）..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd(date);
                    if (e.key === 'Escape') setAddingDate(null);
                  }}
                  maxLength={500}
                  autoFocus
                  data-testid="new-record-input"
                />
                <div className="add-form-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAdd(date)}
                    disabled={submitting || !newContent.trim()}
                    data-testid="submit-record-btn"
                  >
                    {submitting ? <span className="spinner" /> : '确认添加'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setAddingDate(null)}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 空状态 */}
            {dayRecords.length === 0 && !isAdding && (
              <p className="day-empty">暂无事项</p>
            )}
          </div>
        );
      })}

      <style>{`
        .record-list-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .record-list-header h2 { font-size: 18px; }
        .total-badge {
          background: var(--primary-light);
          color: var(--primary);
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .day-block {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          margin-bottom: 12px;
          overflow: hidden;
        }
        .day-block.today {
          border-color: var(--primary);
          box-shadow: 0 0 0 1px var(--primary);
        }
        .day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid var(--border);
        }
        .day-block.today .day-header { background: var(--primary-light); }
        .day-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .day-name { font-weight: 700; font-size: 14px; }
        .day-date { font-size: 12px; color: var(--text-secondary); }
        .today-badge {
          font-size: 11px;
          background: var(--primary);
          color: #fff;
          padding: 1px 6px;
          border-radius: 999px;
        }
        .add-btn { color: var(--primary); }
        .records-ul { list-style: none; }
        .record-item {
          padding: 10px 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        .record-item:last-child { border-bottom: none; }
        .record-view {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .record-content { font-size: 14px; flex: 1; line-height: 1.5; }
        .record-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .record-item:hover .record-actions { opacity: 1; }
        .record-edit {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .record-edit .input { flex: 1; }
        .add-form {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #fafafa;
          border-top: 1px solid var(--border);
        }
        .add-form-actions {
          display: flex;
          gap: 8px;
        }
        .day-empty {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--text-muted);
        }
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
