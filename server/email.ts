import { Resend } from "resend";
import {
  generateBookingConfirmationEmail,
  generatePaymentReminderEmail,
  generateHostNotificationEmail,
} from "./email-templates.ts";

// Initialize Resend client with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Get the email address to send from
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  bookingDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  cuisine: string;
  hostAddress?: string;
  specialRequests?: string;
}

/**
 * Send booking confirmation email to guest (after payment)
 */
export async function sendGuestConfirmationEmail(data: {
  bookingId: number;
  guestName: string;
  guestEmail: string;
  hostName: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: string;
  paymentDate: Date;
  stripeSessionId: string;
}) {
  const htmlContent = generateBookingConfirmationEmail(data);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.guestEmail,
      subject: `🎉 Your Dining Experience is Confirmed! - +1 Chopsticks`,
      html: htmlContent,
    });
    console.log(`[Email] Guest confirmation sent to ${data.guestEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send guest confirmation:", error);
    return false;
  }
}

/**
 * Send payment reminder email to guest
 */
export async function sendPaymentReminderEmail(data: {
  bookingId: number;
  guestName: string;
  guestEmail: string;
  hostName: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: string;
  paymentLink: string;
}) {
  const htmlContent = generatePaymentReminderEmail(data);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.guestEmail,
      subject: `⏳ Complete Your Booking Payment - +1 Chopsticks`,
      html: htmlContent,
    });
    console.log(`[Email] Payment reminder sent to ${data.guestEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send payment reminder:", error);
    return false;
  }
}

/**
 * Send host notification email (when booking is confirmed)
 */
export async function sendHostConfirmationEmail(data: {
  bookingId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: number;
  dietaryRestrictions: string | null;
  hostName: string;
  hostEmail: string;
  hostEarnings: number;
}) {
  const htmlContent = generateHostNotificationEmail(data);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.hostEmail,
      subject: `🎉 New Confirmed Booking! - +1 Chopsticks`,
      html: htmlContent,
    });
    console.log(`[Email] Host confirmation sent to ${data.hostEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send host confirmation:", error);
    return false;
  }
}

/**
 * Send host profile approval email
 */
export async function sendHostApprovalEmail(
  hostName: string,
  hostEmail: string,
  district: string,
  cuisineStyle: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B3A3A;">🎉 Your Profile Has Been Approved!</h2>
      
      <p>Hi ${hostName},</p>
      
      <p>Congratulations! Your host profile has been approved and is now live on our platform.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Your Profile Details</h3>
        <p><strong>District:</strong> ${district}</p>
        <p><strong>Cuisine Style:</strong> ${cuisineStyle}</p>
        <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">APPROVED</span></p>
      </div>
      
      <p><strong>What Happens Next:</strong></p>
      <ul>
        <li>Your profile is now visible to guests searching for dinner experiences</li>
        <li>You can log in to your dashboard to manage bookings and availability</li>
        <li>Guests will start sending booking requests based on your availability</li>
        <li>You'll receive notifications when guests request to dine with you</li>
      </ul>
      
      <p><strong>Quick Links:</strong></p>
      <ul>
        <li><a href="https://dineatlocal.com/host-dashboard" style="color: #8B3A3A; text-decoration: none;">Go to Host Dashboard</a></li>
        <li><a href="https://dineatlocal.com/help" style="color: #8B3A3A; text-decoration: none;">View Help Center</a></li>
      </ul>
      
      <p>We're excited to have you as part of our community! If you have any questions, please don't hesitate to reach out.</p>
      
      <p>Happy hosting!<br>The +1 Chopsticks Team</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated email. Please do not reply to this address.
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: hostEmail,
      subject: "🎉 Your Host Profile Has Been Approved!",
      html: htmlContent,
    });
    console.log(`[Email] Host approval email sent to ${hostEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send host approval email:", error);
    return false;
  }
}

export async function sendGuestRejectionEmail(
  guestName: string,
  guestEmail: string,
  hostName: string,
  reason?: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B3A3A;">Booking Update</h2>
      
      <p>Hi ${guestName},</p>
      
      <p>Unfortunately, ${hostName} is unable to accommodate your booking request at this time.</p>
      
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      
      <p>We encourage you to:</p>
      <ul>
        <li>Browse other available hosts in your area</li>
        <li>Try booking for different dates</li>
        <li>Contact our support team if you have questions</li>
      </ul>
      
      <p>We hope to host you soon!</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated email. Please do not reply to this address.
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: guestEmail,
      subject: `Booking Update from ${hostName}`,
      html: htmlContent,
    });
    console.log(`[Email] Rejection email sent to ${guestEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send rejection email:", error);
    return false;
  }
}

/**
 * Generic email sending function
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const result = await resend.emails.send({
      from: options.from || EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`[Email] Email sent to ${options.to}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    throw error;
  }
}
