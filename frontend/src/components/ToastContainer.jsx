/**
 * Toast 通知容器组件
 */
import React from 'react';
import useStore from '../store/useStore.js';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          data-testid={`toast-${toast.type}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
