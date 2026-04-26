/**
 * 周选择器组件
 * 支持上一周/下一周切换，显示当前周日期范围
 */
import React from 'react';
import dayjs from 'dayjs';
import useStore from '../store/useStore.js';
import { getWeekStart } from '../store/useStore.js';

export default function WeekSelector() {
  const { currentWeekStart, setCurrentWeekStart } = useStore();

  const weekEnd = dayjs(currentWeekStart).add(6, 'day').format('YYYY-MM-DD');
  const isCurrentWeek = currentWeekStart === getWeekStart(dayjs().format('YYYY-MM-DD'));

  function prevWeek() {
    const prev = dayjs(currentWeekStart).subtract(7, 'day').format('YYYY-MM-DD');
    setCurrentWeekStart(prev);
  }

  function nextWeek() {
    const next = dayjs(currentWeekStart).add(7, 'day').format('YYYY-MM-DD');
    setCurrentWeekStart(next);
  }

  function goToCurrentWeek() {
    setCurrentWeekStart(getWeekStart(dayjs().format('YYYY-MM-DD')));
  }

  return (
    <div className="week-selector" data-testid="week-selector">
      <button
        className="btn btn-ghost btn-sm"
        onClick={prevWeek}
        data-testid="prev-week-btn"
        title="上一周"
      >
        ‹
      </button>

      <span className="week-label" data-testid="week-label">
        {currentWeekStart} ~ {weekEnd}
      </span>

      <button
        className="btn btn-ghost btn-sm"
        onClick={nextWeek}
        data-testid="next-week-btn"
        title="下一周"
      >
        ›
      </button>

      {!isCurrentWeek && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={goToCurrentWeek}
          data-testid="go-current-week-btn"
          title="回到本周"
        >
          本周
        </button>
      )}

      <style>{`
        .week-selector {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .week-label {
          font-size: 13px;
          color: var(--text-secondary);
          min-width: 190px;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
