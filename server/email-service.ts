import { MailService } from '@sendgrid/mail';
import { User, Message } from '@shared/schema';

// Ensure SendGrid API key is available
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email notifications will not be sent.");
}

// Initialize SendGrid client
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send a new message notification email
 * @param recipient The user receiving the email notification
 * @param message The message that was sent
 * @param sender The user who sent the message
 */
export async function sendNewMessageNotification(
  recipient: User,
  message: Message,
  sender: User
): Promise<boolean> {
  // Skip if no API key or no recipient email
  if (!process.env.SENDGRID_API_KEY || !recipient.email) {
    return false;
  }

  try {
    // Format the message
    const emailSubject = `New Message: ${message.subject}`;
    
    // Create HTML content with appropriate styling
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #1d2633; padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">You have a new message on Inmobi®</h1>
        </div>
        <div style="padding: 20px;">
          <p style="margin-top: 0;">Hello ${recipient.fullName},</p>
          
          <p>You've received a new message from <strong>${sender.fullName}</strong> (${getSenderRoleDisplay(sender.role)}).</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #1d2633; padding: 15px; margin: 20px 0;">
            <h2 style="margin-top: 0; font-size: 18px; color: #1d2633;">${message.subject}</h2>
            <p style="margin-bottom: 0; color: #555;">${message.content.substring(0, 200)}${message.content.length > 200 ? '...' : ''}</p>
          </div>
          
          <p>Please log in to your Inmobi account to read the full message and reply.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.APP_URL || 'https://inmobi.mobi'}/dashboard/messages" 
               style="background-color: #2e74b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Message
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px;">If you don't want to receive message notifications, you can update your preferences in your account settings.</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 0 0 5px 5px; font-size: 12px; color: #777; text-align: center;">
          <p>&copy; ${new Date().getFullYear()} Inmobi®. All rights reserved.</p>
          <p>c. de la Ribera 14, 08003 Barcelona</p>
        </div>
      </div>
    `;

    // Create a plain text version for email clients that don't support HTML
    const textContent = `
      You have a new message on Inmobi
      
      Hello ${recipient.fullName},
      
      You've received a new message from ${sender.fullName} (${getSenderRoleDisplay(sender.role)}).
      
      Subject: ${message.subject}
      
      Message: ${message.content.substring(0, 200)}${message.content.length > 200 ? '...' : ''}
      
      Please log in to your Inmobi account to read the full message and reply: ${process.env.APP_URL || 'https://inmobi.mobi'}/dashboard/messages
      
      If you don't want to receive message notifications, you can update your preferences in your account settings.
      
      © ${new Date().getFullYear()} Inmobi®. All rights reserved.
      c. de la Ribera 14, 08003 Barcelona
    `;

    // Send the email
    await mailService.send({
      to: recipient.email,
      from: {
        email: 'notifications@inmobi.mobi',
        name: 'Inmobi Messaging'
      },
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Get a display-friendly version of the user role
 */
function getSenderRoleDisplay(role: string): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'agent':
      return 'Real Estate Agent';
    case 'user':
      return 'User';
    default:
      return 'User';
  }
}