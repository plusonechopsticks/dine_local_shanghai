const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Photo directory
const photoDir = '/tmp/jiading_ayi_photos';
const photos = [
  'profile_1440x960.jpg',
  'food_1_1440x960.jpg',
  'food_2_1440x960.jpg',
  'food_3_1440x960.jpg',
  'food_4_1440x960.jpg'
];

// Prepare attachments
const attachments = photos.map(photo => ({
  filename: photo,
  path: path.join(photoDir, photo)
}));

// Email content
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'jiejieshugen@gmail.com',
  subject: 'Jiading Ayi - Viator Profile Photos (1440x960px)',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #c0392b;">Jiading Ayi - Viator Profile Photos</h2>
      
      <p>Hi,</p>
      
      <p>Please find attached 5 high-quality photos for Jiading Ayi's Viator profile, all resized to the required 1440x960px dimensions:</p>
      
      <ul>
        <li><strong>profile_1440x960.jpg</strong> - Host profile photo</li>
        <li><strong>food_1_1440x960.jpg</strong> - Food photo 1</li>
        <li><strong>food_2_1440x960.jpg</strong> - Food photo 2</li>
        <li><strong>food_3_1440x960.jpg</strong> - Food photo 3</li>
        <li><strong>food_4_1440x960.jpg</strong> - Food photo 4</li>
      </ul>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Photo Specifications:</strong></p>
        <ul>
          <li>Dimensions: 1440 x 960 pixels</li>
          <li>Aspect Ratio: 3:2</li>
          <li>Format: JPEG (high quality)</li>
          <li>All photos have been resized from original dimensions</li>
        </ul>
      </div>
      
      <p>These photos are ready to upload to Viator for Jiading Ayi's public profile.</p>
      
      <p>Best regards,<br>+1 Chopsticks Team</p>
    </div>
  `,
  attachments: attachments
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  } else {
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    process.exit(0);
  }
});
