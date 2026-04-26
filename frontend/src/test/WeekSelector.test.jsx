/**
 * 组件测试 - WeekSelector 周选择器
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeekSelector from '../components/WeekSelector.jsx';
import useStore from '../store/useStore.js';

// 重置 store 状态
beforeEach(() => {
  useStore.setState({
    currentWeekStart: '2024-01-08',
    records: [],
    weekReport: null,
  });
});

describe('WeekSelector', () => {
  it('应正确渲染周选择器', () => {
    render(<WeekSelector />);
    expect(screen.getByTestId('week-selector')).toBeInTheDocument();
    expect(screen.getByTestId('week-label')).toBeInTheDocument();
  });

  it('应显示当前周的日期范围', () => {
    render(<WeekSelector />);
    const label = screen.getByTestId('week-label');
    expect(label).toHaveTextContent('2024-01-08');
    expect(label).toHaveTextContent('2024-01-14');
  });

  it('点击上一周按钮应切换到上一周', () => {
    render(<WeekSelector />);
    fireEvent.click(screen.getByTestId('prev-week-btn'));
    const label = screen.getByTestId('week-label');
    expect(label).toHaveTextContent('2024-01-01');
  });

  it('点击下一周按钮应切换到下一周', () => {
    render(<WeekSelector />);
    fireEvent.click(screen.getByTestId('next-week-btn'));
    const label = screen.getByTestId('week-label');
    expect(label).toHaveTextContent('2024-01-15');
  });

  it('不是当前周时显示"本周"按钮', () => {
    // currentWeekStart 已经是固定的过去日期，所以"本周"按钮应该显示
    render(<WeekSelector />);
    expect(screen.getByTestId('go-current-week-btn')).toBeInTheDocument();
  });
});
