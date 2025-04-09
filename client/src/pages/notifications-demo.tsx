import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BellRing, Check, AlertTriangle, Info, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BubbleNotification } from '@/components/ui/bubble-notification';
import { v4 as uuidv4 } from 'uuid';

type NotificationItem = {
  id: string;
  message: string;
  title?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  duration?: number;
};

const exampleNotifications = [
  {
    id: '1',
    title: 'Success',
    message: 'Property saved to favorites!',
    variant: 'success' as const,
    icon: <Check size={20} />,
    duration: 5000
  },
  {
    id: '2',
    title: 'Error',
    message: 'Failed to connect to server',
    variant: 'error' as const,
    icon: <X size={20} />,
    duration: 5000
  },
  {
    id: '3',
    title: 'Warning',
    message: 'Your subscription will expire soon',
    variant: 'warning' as const,
    icon: <AlertTriangle size={20} />,
    duration: 5000
  },
  {
    id: '4',
    title: 'Information',
    message: 'New property listings available',
    variant: 'info' as const,
    icon: <Info size={20} />,
    duration: 5000
  },
  {
    id: '5',
    title: 'Message',
    message: 'You have 3 new messages from property owners',
    variant: 'default' as const,
    icon: <MessageCircle size={20} />,
    duration: 5000
  }
];

export default function NotificationsDemo() {
  const [activeNotifications, setActiveNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = uuidv4();
    setActiveNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove notification after duration
    if (notification.duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setActiveNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setActiveNotifications([]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6 space-x-2">
        <BellRing className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Bubble Notifications Demo</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Examples</h2>
          <div className="grid grid-cols-1 gap-3">
            {exampleNotifications.map((notification) => (
              <Button 
                key={notification.id}
                onClick={() => addNotification(notification)}
                variant="outline"
                className="justify-start"
              >
                <span className="mr-2">{notification.icon}</span>
                {notification.title}
              </Button>
            ))}
          </div>
          <Button 
            onClick={clearAll} 
            variant="destructive" 
            className="mt-4"
          >
            Clear All
          </Button>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">About Bubble Notifications</h2>
          <p className="mb-4">
            Bubble notifications provide a modern, user-friendly way to 
            communicate important information to your users. They are fully 
            customizable in terms of appearance, positioning, and behavior.
          </p>
          <h3 className="text-lg font-medium mt-4 mb-2">Features:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Multiple variants: default, success, error, warning, info</li>
            <li>Flexible positioning: top-right, top-left, bottom-right, bottom-left, center</li>
            <li>Customizable duration</li>
            <li>Optional icons and close button</li>
            <li>Smooth animations</li>
            <li>Progress indicator</li>
          </ul>
        </Card>
      </div>
      
      {/* Notification container */}
      <div className="fixed top-4 right-4 flex flex-col gap-3 z-50 max-w-md">
        <AnimatePresence>
          {activeNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <BubbleNotification
                id={notification.id}
                title={notification.title}
                message={notification.message}
                variant={notification.variant}
                icon={notification.icon}
                duration={notification.duration}
                position="top-right"
                onClose={() => removeNotification(notification.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}