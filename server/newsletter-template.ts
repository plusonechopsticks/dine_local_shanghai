/**
 * Newsletter Email Template - Morning Brew Style
 * Uses table-based layout for email client compatibility and forwarding support
 * Matches the visual design from the preferred template
 */

interface NewsletterContent {
  founderNote: string;
  cnyRecommendations: {
    intro: string;
    places: Array<{
      name: string;
      chineseName: string;
      description: string;
      tip: string;
      dates?: string;
    }>;
    ps?: string;
    photoUrl: string;
  };
  featuredHost: {
    name: string;
    title: string;
    cuisineStyle: string;
    district: string;
    pricePerPerson: number;
    profilePhotoUrl?: string;
    foodPhotoUrls: string[];
    bio: string;
    signatureDishes: string[];
    hostId: number;
  };
}

export function generateNewsletterHtml(content: NewsletterContent): string {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const baseUrl = process.env.VITE_WEBSITE_URL || 'https://plus1chopsticks.manus.space';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>+1 Chopsticks Newsletter</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Outer wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        
        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 680px; margin: 0 auto; background-color: #111827; border-radius: 12px;">
          
          <!-- Logo & Tagline -->
          <tr>
            <td style="padding: 40px 32px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">🥢 +1 Chopsticks</h1>
              <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">Authentic home dining experiences in China</p>
            </td>
          </tr>
          
          <!-- FOUNDER'S NOTE Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #262626; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #818cf8;">From Steven, Founder and CEO</p>
                    <div style="font-size: 14px; color: #e5e7eb; line-height: 1.65;">
                      ${content.founderNote.split('\n\n').map(para => `<p style="margin: 0 0 14px 0; color: #e5e7eb;">${para}</p>`).join('')}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- FEATURED HOST Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #262626; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #818cf8; letter-spacing: 1px; text-transform: uppercase;">FEATURED HOST</p>
                    
                    <!-- Host Profile Photo -->
                    ${content.featuredHost.profilePhotoUrl ? `
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td>
                          <img src="${content.featuredHost.profilePhotoUrl}" alt="${content.featuredHost.name}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block;" />
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Host Info -->
                    <h3 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">${content.featuredHost.name}</h3>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #818cf8; font-weight: 600;">${content.featuredHost.cuisineStyle}</p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #9ca3af; line-height: 1.5;">
                      ${content.featuredHost.district} · ¥${content.featuredHost.pricePerPerson}/person
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #e5e7eb; line-height: 1.65;">${content.featuredHost.bio.split('Her philosophy')[0].trim()}</p>
                    ${content.featuredHost.bio.includes('Her philosophy') ? `<p style="margin: 0 0 16px 0; font-size: 14px; color: #e5e7eb; line-height: 1.65;">Her philosophy${content.featuredHost.bio.split('Her philosophy')[1]}</p>` : ''}
                    
                    <!-- Signature Dishes -->
                    ${content.featuredHost.signatureDishes.length > 0 ? `
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #ffffff;">Signature Dishes:</p>
                    <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 14px; color: #e5e7eb; line-height: 1.7;">
                      ${content.featuredHost.signatureDishes.map(dish => `<li style="margin-bottom: 4px;">${dish}</li>`).join('')}
                    </ul>
                    ` : ''}
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 6px; background-color: #818cf8;">
                          <a href="${baseUrl}/hosts/${content.featuredHost.hostId}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">View Profile & Book</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CNY RECOMMENDATIONS Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #262626; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #818cf8; letter-spacing: 1px; text-transform: uppercase;">WHAT TO DO IN SHANGHAI DURING CNY</p>
                    
                    <!-- CNY Photo -->
                    ${content.cnyRecommendations.photoUrl ? `
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td>
                          <img src="${content.cnyRecommendations.photoUrl}" alt="CNY Decorations" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block;" />
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Intro (split into paragraphs) -->
                    <div style="margin-bottom: 20px;">
                      ${content.cnyRecommendations.intro.split('\n\n').map(para => `<p style="margin: 0 0 14px 0; font-size: 14px; color: #e5e7eb; line-height: 1.65;">${para}</p>`).join('')}
                    </div>
                    
                    <!-- Places List -->
                    ${content.cnyRecommendations.places.map((place, index) => `
                      <div style="margin-bottom: ${index < content.cnyRecommendations.places.length - 1 ? '24px' : '0'};">
                        <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                          ${index + 1}. ${place.name} ${place.chineseName}
                        </p>
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #e5e7eb; line-height: 1.65;">
                          ${place.description}
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #818cf8; line-height: 1.6;">
                          <strong>🥢 +1 Chopsticks tip:</strong> ${place.tip}
                        </p>
                        ${place.dates ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af; font-style: italic;">${place.dates}</p>` : ''}
                      </div>
                    `).join('')}
                    
                    ${content.cnyRecommendations.ps ? `<p style="margin: 24px 0 0 0; font-size: 14px; color: #9ca3af; font-style: italic;">${content.cnyRecommendations.ps}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- HELP US GROW Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1e293b; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #818cf8; letter-spacing: 1px; text-transform: uppercase;">HELP US GROW</p>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #e5e7eb; line-height: 1.65;">
                      Know someone who'd love authentic home dining in China? Forward this email to them!
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #e5e7eb; line-height: 1.65;">
                      Or if you're a local who loves cooking and hosting, <a href="${baseUrl}/host-register" style="color: #818cf8; text-decoration: underline;">become a host</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                <a href="${baseUrl}" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Home</a> ·
                <a href="${baseUrl}/hosts" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Browse Hosts</a> ·
                <a href="${baseUrl}/host-register" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Become a Host</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #4b5563;">
                <a href="${baseUrl}/unsubscribe" style="color: #4b5563; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}
