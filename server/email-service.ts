import sgMail from '@sendgrid/mail';
import { User, Message } from '@shared/schema';

// Configure SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY not set. Email notifications will not be sent.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'info@inmobi.mobi';
const SITE_URL = 'https://inmobi.mobi';

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
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Email notification not sent: SENDGRID_API_KEY not configured");
    return false;
  }

  try {
    // Get sender role display text
    const senderRole = getSenderRoleDisplay(sender.role);
    
    // Prepare the email
    const msg = {
      to: recipient.email,
      from: FROM_EMAIL,
      subject: `Inmobi: New message from ${sender.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #131c28; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Inmobi</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <p>Hello ${recipient.fullName},</p>
            <p>You have received a new message from <strong>${sender.fullName}</strong> (${senderRole}).</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #131c28; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Subject: ${message.subject}</h3>
              <p style="color: #555;">${message.content.substring(0, 150)}${message.content.length > 150 ? '...' : ''}</p>
            </div>
            
            <p>Please login to your account to view and respond to this message.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${SITE_URL}/dashboard?tab=messages" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Message
              </a>
            </div>
            
            <p style="color: #777; font-size: 12px;">
              This is an automated message, please do not reply directly to this email.
            </p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            &copy; ${new Date().getFullYear()} Inmobi. All rights reserved.<br>
            c. de la Ribera 14, 08003 Barcelona
          </div>
        </div>
      `,
    };

    // Send the email
    await sgMail.send(msg);
    console.log(`Email notification sent to ${recipient.email}`);
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
    default:
      return 'User';
  }
}