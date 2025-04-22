import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
    duration: number;
  }>({
    show: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    setToast({
      show: true,
      message,
      type: options?.type || 'info',
      duration: options?.duration || 3000,
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};