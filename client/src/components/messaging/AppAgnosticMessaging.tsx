import { useEffect, useState } from 'react';
import { GmailStyleMessaging } from './GmailStyleMessaging';
import { MobileGmailStyleMessaging } from './mobile/MobileGmailStyleMessaging';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppAgnosticMessagingProps {
  userId: number;
}

/**
 * Platform-agnostic messaging component that selects the appropriate 
 * implementation based on the current platform/device
 */
export function AppAgnosticMessaging({ userId }: AppAgnosticMessagingProps) {
  const isMobile = useIsMobile();
  
  // We need to use client-side rendering for this component
  // to ensure the correct platform is detected
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileGmailStyleMessaging userId={userId} />
      ) : (
        <GmailStyleMessaging userId={userId} />
      )}
    </>
  );
}