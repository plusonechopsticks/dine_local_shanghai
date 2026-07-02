import * as dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@plus1chopsticks.com';

console.log('Sending test email to plusonechopsticks@gmail.com...');
const result = await resend.emails.send({
  from: EMAIL_FROM,
  to: 'plusonechopsticks@gmail.com',
  subject: '✅ Test Email from +1 Chopsticks (Resend)',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #8B3A3A; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">+1 Chopsticks — Test Email</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p>Hi Steven,</p>
        <p>This is a test email sent directly via the Resend API to confirm that email delivery to <strong>plusonechopsticks@gmail.com</strong> is working correctly.</p>
        <p>If you're reading this, everything is working! 🎉</p>
        <p>Sent at: ${new Date().toUTCString()}</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
        <p>+1 Chopsticks · <a href="https://plus1chopsticks.com" style="color: #8B3A3A;">plus1chopsticks.com</a></p>
      </div>
    </div>
  `,
});

console.log('Result:', JSON.stringify(result, null, 2));
