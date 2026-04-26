/**
 * 组件测试 - RecordList 事项列表
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordList from '../components/RecordList.jsx';
import useStore from '../store/useStore.js';

// Mock API 模块
vi.mock('../api/records.js', () => ({
  getRecordsByWeek: vi.fn().mockResolvedValue([]),
  createRecord: vi.fn(),
  updateRecord: vi.fn(),
  deleteRecord: vi.fn(),
}));

beforeEach(() => {
  useStore.setState({
    currentWeekStart: '2024-01-08',
    records: [],
    recordsLoading: false,
    recordsError: null,
    toasts: [],
  });
});

describe('RecordList', () => {
  it('应渲染本周 7 天的日期块', () => {
    render(<RecordList />);
    // 2024-01-08 ~ 2024-01-14 共 7 天
    expect(screen.getByTestId('day-block-2024-01-08')).toBeInTheDocument();
    expect(screen.getByTestId('day-block-2024-01-14')).toBeInTheDocument();
  });

  it('应显示已有的事项', () => {
    useStore.setState({
      records: [
        { id: 1, date: '2024-01-08', content: '完成登录模块', week_start: '2024-01-08' },
        { id: 2, date: '2024-01-09', content: '设计数据库', week_start: '2024-01-08' },
      ],
    });
    render(<RecordList />);
    expect(screen.getByTestId('record-content-1')).toHaveTextContent('完成登录模块');
    expect(screen.getByTestId('record-content-2')).toHaveTextContent('设计数据库');
  });

  it('点击"添加"按钮应显示输入框', () => {
    render(<RecordList />);
    const addBtn = screen.getByTestId('add-record-btn-2024-01-08');
    fireEvent.click(addBtn);
    expect(screen.getByTestId('new-record-input')).toBeInTheDocument();
  });

  it('提交按钮在内容为空时应禁用', () => {
    render(<RecordList />);
    fireEvent.click(screen.getByTestId('add-record-btn-2024-01-08'));
    const submitBtn = screen.getByTestId('submit-record-btn');
    expect(submitBtn).toBeDisabled();
  });

  it('输入内容后提交按钮应可用', () => {
    render(<RecordList />);
    fireEvent.click(screen.getByTestId('add-record-btn-2024-01-08'));
    const input = screen.getByTestId('new-record-input');
    fireEvent.change(input, { target: { value: '测试事项' } });
    const submitBtn = screen.getByTestId('submit-record-btn');
    expect(submitBtn).not.toBeDisabled();
  });

  it('加载状态下应显示 spinner', () => {
    useStore.setState({ recordsLoading: true });
    render(<RecordList />);
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应显示事项总数', () => {
    useStore.setState({
      records: [
        { id: 1, date: '2024-01-08', content: '事项1', week_start: '2024-01-08' },
        { id: 2, date: '2024-01-08', content: '事项2', week_start: '2024-01-08' },
      ],
    });
    render(<RecordList />);
    expect(screen.getByText('2 条')).toBeInTheDocument();
  });
});
