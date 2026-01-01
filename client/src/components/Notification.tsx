import React, { useEffect, useState } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type?: NotificationType;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };

  return (
    <div className={`fixed top-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-fade-in-up min-w-[300px] ${styles[type]}`}>
      <i className={`fas ${icons[type]} text-lg`}></i>
      <div className="flex-1 text-sm font-bold">{message}</div>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};