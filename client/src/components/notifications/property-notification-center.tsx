import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePropertyNotifications } from '@/hooks/use-property-notifications';
import { Bell, BellOff, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn, formatTimeAgo, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function PropertyNotificationCenter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const {
    notifications,
    connectionStatus,
    subscribe,
    unsubscribe,
    clearNotifications,
    recentProperties
  } = usePropertyNotifications();
  
  useEffect(() => {
    if (user) {
      subscribe({
        // Default filters - empty to receive all notifications
        // Users can customize this in preferences
      });
    }
    
    return () => {
      if (user) {
        unsubscribe();
      }
    };
  }, [user]);
  
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const handleToggleSubscription = useCallback(() => {
    if (connectionStatus === 'connected') {
      unsubscribe();
      toast({
        title: t('notifications.status.disconnected'),
        description: t('notifications.unsubscribed'),
      });
    } else {
      subscribe();
      toast({
        title: t('notifications.status.connecting'),
        description: t('notifications.subscribing'),
      });
    }
  }, [connectionStatus, subscribe, unsubscribe, t, toast]);
  
  const handleClearNotifications = useCallback(() => {
    clearNotifications();
    setOpen(false);
  }, [clearNotifications]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t('notifications.toggle')}>
          {connectionStatus === 'connected' ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          <span className={cn(
            'absolute top-0 right-0 h-2 w-2 rounded-full',
            getConnectionStatusColor()
          )} />
          
          {notifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {notifications.length > 9 ? '9+' : notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 glassmorphism-card">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{t('notifications.title')}</h4>
            <Badge variant="outline" className="capitalize">
              {t(`notifications.status.${connectionStatus}`)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleSubscription}
              title={connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
            >
              {connectionStatus === 'connected' ? (
                <BellOff className="h-4 w-4" />
              ) : connectionStatus === 'connecting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </Button>
            
            {notifications.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleClearNotifications}
                title={t('notifications.clearAll')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">{t('notifications.empty')}</p>
            </div>
          ) : (
            <div className="grid gap-1 p-1">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/properties/${notification.property.id}`}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-start gap-4 p-3 hover:bg-primary/5 rounded-lg transition-colors">
                    <div 
                      className="w-12 h-12 rounded-md bg-cover bg-center flex-shrink-0"
                      style={{ 
                        backgroundImage: notification.property.images && notification.property.images.length > 0
                          ? `url(${notification.property.images[0]})` 
                          : 'none'
                      }}
                    >
                      {!(notification.property.images && notification.property.images.length > 0) && (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-md">
                          <AlertTriangle className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.type === 'newProperty' 
                          ? t('notifications.newProperty') 
                          : t('notifications.updatedProperty')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.property.title || `${notification.property.bedrooms} ${t('property.bedrooms')}, ${notification.property.bathrooms} ${t('property.bathrooms')}`}
                      </p>
                      <p className="text-xs font-medium text-primary truncate">
                        {notification.property.price ? formatPrice(notification.property.price) : 'Price on request'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    
                    {notification.property.isPremium && (
                      <Badge variant="secondary" className="ml-auto flex-shrink-0">
                        Premium
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}