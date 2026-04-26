/**
 * 全局状态管理（Zustand）
 * 管理当前周、事项列表、周报内容
 */
import { create } from 'zustand';
import dayjs from 'dayjs';
import * as recordsApi from '../api/records';
import * as reportsApi from '../api/reports';

/** 获取某日期所在周的周一 */
function getWeekStart(date) {
  const d = dayjs(date);
  const day = d.day(); // 0=周日
  const diff = day === 0 ? -6 : 1 - day;
  return d.add(diff, 'day').format('YYYY-MM-DD');
}

const useStore = create((set, get) => ({
  // ── 当前选中周 ──────────────────────────────────────
  currentWeekStart: getWeekStart(dayjs().format('YYYY-MM-DD')),
  setCurrentWeekStart: (weekStart) => {
    set({ currentWeekStart: weekStart, records: [], weekReport: null });
    get().fetchRecords(weekStart);
    get().fetchWeekReport(weekStart);
  },

  // ── 事项列表 ─────────────────────────────────────────
  records: [],
  recordsLoading: false,
  recordsError: null,

  fetchRecords: async (weekStart) => {
    const ws = weekStart || get().currentWeekStart;
    set({ recordsLoading: true, recordsError: null });
    try {
      const data = await recordsApi.getRecordsByWeek(ws);
      set({ records: data || [], recordsLoading: false });
    } catch (err) {
      set({ recordsError: err.message, recordsLoading: false });
    }
  },

  addRecord: async ({ date, content }) => {
    const record = await recordsApi.createRecord({ date, content });
    set((state) => ({ records: [...state.records, record] }));
    return record;
  },

  updateRecord: async (id, content) => {
    const updated = await recordsApi.updateRecord(id, content);
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? updated : r)),
    }));
    return updated;
  },

  removeRecord: async (id) => {
    await recordsApi.deleteRecord(id);
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },

  // ── 周报 ─────────────────────────────────────────────
  weekReport: null,
  reportLoading: false,
  reportError: null,
  generating: false,

  fetchWeekReport: async (weekStart) => {
    const ws = weekStart || get().currentWeekStart;
    set({ reportLoading: true, reportError: null });
    try {
      const data = await reportsApi.getWeekReport(ws);
      set({ weekReport: data, reportLoading: false });
    } catch (err) {
      set({ reportError: err.message, reportLoading: false });
    }
  },

  generateReport: async () => {
    const weekStart = get().currentWeekStart;
    set({ generating: true, reportError: null });
    try {
      const report = await reportsApi.generateReport(weekStart);
      set({ weekReport: report, generating: false });
      return report;
    } catch (err) {
      set({ reportError: err.message, generating: false });
      throw err;
    }
  },

  saveReport: async (content) => {
    const weekStart = get().currentWeekStart;
    set({ reportLoading: true });
    try {
      const report = await reportsApi.saveReport({ weekStart, content });
      set({ weekReport: report, reportLoading: false });
      return report;
    } catch (err) {
      set({ reportError: err.message, reportLoading: false });
      throw err;
    }
  },

  // ── Toast 通知 ───────────────────────────────────────
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // ── 当前激活 Tab ────────────────────────────────────
  activeTab: 'records', // 'records' | 'report' | 'history'
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useStore;
export { getWeekStart };
