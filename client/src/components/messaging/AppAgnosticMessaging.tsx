import { useIsMobile } from '@/hooks/use-mobile';
import { GmailStyleMessaging } from './GmailStyleMessaging';
import { MobileGmailStyleMessaging } from './mobile/MobileGmailStyleMessaging';

interface AppAgnosticMessagingProps {
  userId: number;
}

export function AppAgnosticMessaging({ userId }: AppAgnosticMessagingProps) {
  const isMobile = useIsMobile();
  
  // Render the appropriate messaging interface based on device type
  if (isMobile) {
    return <MobileGmailStyleMessaging userId={userId} />;
  }
  
  return <GmailStyleMessaging userId={userId} />;
}