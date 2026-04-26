/**
 * 组件测试 - ReportPanel 周报面板
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportPanel from '../components/ReportPanel.jsx';
import useStore from '../store/useStore.js';

vi.mock('../api/reports.js', () => ({
  generateReport: vi.fn(),
  saveReport: vi.fn(),
  getWeekReport: vi.fn().mockResolvedValue(null),
  getReportHistory: vi.fn().mockResolvedValue({ reports: [], total: 0 }),
  deleteReport: vi.fn(),
}));

const mockReport = {
  id: 1,
  week_start: '2024-01-08',
  content: '## 本周工作\n- 完成登录模块\n\n## 下周计划\n- 持续迭代',
  is_ai: 1,
  updated_at: '2024-01-14 18:00:00',
};

beforeEach(() => {
  useStore.setState({
    currentWeekStart: '2024-01-08',
    records: [{ id: 1, date: '2024-01-08', content: '完成登录模块', week_start: '2024-01-08' }],
    weekReport: null,
    reportLoading: false,
    generating: false,
    reportError: null,
    toasts: [],
  });
});

describe('ReportPanel', () => {
  it('有事项时生成按钮应可用', () => {
    render(<ReportPanel />);
    const btn = screen.getByTestId('generate-report-btn');
    expect(btn).not.toBeDisabled();
  });

  it('无事项时生成按钮应禁用', () => {
    useStore.setState({ records: [] });
    render(<ReportPanel />);
    const btn = screen.getByTestId('generate-report-btn');
    expect(btn).toBeDisabled();
  });

  it('无事项时应显示空状态提示', () => {
    useStore.setState({ records: [] });
    render(<ReportPanel />);
    expect(screen.getByText('本周暂无工作事项')).toBeInTheDocument();
  });

  it('生成中状态时按钮应禁用并显示 spinner', () => {
    useStore.setState({ generating: true });
    render(<ReportPanel />);
    const btn = screen.getByTestId('generate-report-btn');
    expect(btn).toBeDisabled();
    expect(screen.getByText('AI 生成中...')).toBeInTheDocument();
  });

  it('有周报时应显示预览内容', () => {
    useStore.setState({ weekReport: mockReport });
    render(<ReportPanel />);
    expect(screen.getByTestId('report-preview')).toBeInTheDocument();
  });

  it('有周报时应显示编辑和复制按钮', () => {
    useStore.setState({ weekReport: mockReport });
    render(<ReportPanel />);
    expect(screen.getByTestId('edit-report-btn')).toBeInTheDocument();
    expect(screen.getByTestId('copy-report-btn')).toBeInTheDocument();
  });

  it('点击编辑按钮后应显示 textarea', () => {
    useStore.setState({ weekReport: mockReport });
    render(<ReportPanel />);
    fireEvent.click(screen.getByTestId('edit-report-btn'));
    expect(screen.getByTestId('report-edit-textarea')).toBeInTheDocument();
  });

  it('AI 生成的周报应显示 AI 徽章', () => {
    useStore.setState({ weekReport: mockReport });
    render(<ReportPanel />);
    expect(screen.getByText('🤖 AI 生成')).toBeInTheDocument();
  });
});
