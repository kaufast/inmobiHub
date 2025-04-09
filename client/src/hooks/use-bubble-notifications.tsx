import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { BubbleNotification, BubbleNotificationProps } from '@/components/ui/bubble-notification';
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';

export interface NotificationOptions extends Omit<BubbleNotificationProps, 'id' | 'message' | 'onClose'> {
  id?: string;
}

type NotificationWithId = BubbleNotificationProps & { id: string };

type BubbleNotificationsContextType = {
  notifications: NotificationWithId[];
  showNotification: (message: string, options?: NotificationOptions) => string;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
};

const defaultIcons = {
  default: <Info size={20} />,
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <AlertCircle size={20} />,
};

const BubbleNotificationsContext = createContext<BubbleNotificationsContextType | null>(null);

export interface BubbleNotificationsProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  position?: BubbleNotificationProps['position'];
}

const positionStyles: Record<BubbleNotificationProps['position'] & string, string> = {
  'top-right': 'fixed top-4 right-4 flex flex-col items-end gap-2 z-50',
  'top-left': 'fixed top-4 left-4 flex flex-col items-start gap-2 z-50',
  'bottom-right': 'fixed bottom-4 right-4 flex flex-col-reverse items-end gap-2 z-50',
  'bottom-left': 'fixed bottom-4 left-4 flex flex-col-reverse items-start gap-2 z-50',
  'center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-50',
};

export const BubbleNotificationsProvider = ({
  children,
  maxNotifications = 5,
  position = 'top-right',
}: BubbleNotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);

  const showNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    const id = options.id || uuidv4();
    
    // Set default icon based on variant if no icon is provided
    const icon = options.icon ?? (options.variant ? defaultIcons[options.variant] : defaultIcons.default);
    
    // Create the notification object without the circular reference
    const notification: NotificationWithId = {
      id,
      message,
      title: options.title,
      variant: options.variant,
      position: options.position,
      icon,
      duration: options.duration,
      size: options.size,
      showClose: options.showClose !== undefined ? options.showClose : true,
      onClose: () => {}, // This will be replaced when rendering
    };

    setNotifications(prev => {
      // Remove oldest notifications if we exceed maxNotifications
      const newNotifications = [...prev, notification];
      return newNotifications.slice(Math.max(0, newNotifications.length - maxNotifications));
    });

    return id;
  }, [maxNotifications]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <BubbleNotificationsContext.Provider
      value={{
        notifications,
        showNotification,
        dismissNotification,
        clearAll,
      }}
    >
      {children}
      <div className={positionStyles[position]}>
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <BubbleNotification
                {...notification}
                onClose={() => dismissNotification(notification.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </BubbleNotificationsContext.Provider>
  );
};

export const useBubbleNotifications = () => {
  const context = useContext(BubbleNotificationsContext);
  
  if (!context) {
    throw new Error('useBubbleNotifications must be used within a BubbleNotificationsProvider');
  }
  
  return {
    ...context,
    notify: context.showNotification,
    success: (message: string, options?: Omit<NotificationOptions, 'variant'>) => 
      context.showNotification(message, { ...options, variant: 'success' }),
    error: (message: string, options?: Omit<NotificationOptions, 'variant'>) => 
      context.showNotification(message, { ...options, variant: 'error' }),
    warning: (message: string, options?: Omit<NotificationOptions, 'variant'>) => 
      context.showNotification(message, { ...options, variant: 'warning' }),
    info: (message: string, options?: Omit<NotificationOptions, 'variant'>) => 
      context.showNotification(message, { ...options, variant: 'info' }),
  };
};