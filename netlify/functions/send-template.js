const https = require('https');

// Email templates for each resource
const emailTemplates = {
  'Mileage Log Template': {
    subject: '📊 Your FREE Mileage Log Template from TaxFix',
    filename: 'TaxFix_Mileage_Log_2025.xlsx',
    description: 'Professional mileage tracking template with automatic calculations and IRS-compliant format'
  },
  'Business Expense Tracker': {
    subject: '💰 Your FREE Business Expense Tracker from TaxFix', 
    filename: 'TaxFix_Business_Expense_Tracker_2025.xlsx',
    description: 'Comprehensive expense tracker with 30+ categories and quarterly summaries'
  },
  '2025 Tax Deadline Calendar': {
    subject: '📅 Your FREE 2025 Tax Deadline Calendar from TaxFix',
    filename: 'TaxFix_2025_Tax_Deadline_Calendar.xlsx', 
    description: 'Complete tax calendar with all important dates for gig workers and freelancers'
  },
  'Home Office Deduction Calculator': {
    subject: '🏠 Your FREE Home Office Calculator from TaxFix',
    filename: 'TaxFix_Home_Office_Deduction_Calculator_2025.xlsx',
    description: 'Advanced calculator comparing simplified vs. actual expense methods'
  }
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const body = new URLSearchParams(event.body);
    const firstName = body.get('firstName');
    const email = body.get('email'); 
    const templateType = body.get('template-type');
    const formName = body.get('form-name');

    // Validate required fields
    if (!firstName || !email || !templateType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get template info
    const template = emailTemplates[templateType];
    if (!template) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid template type' })
      };
    }

    // Create email content
    const emailHtml = createEmailTemplate(firstName, templateType, template);
    
    // For now, we'll just log the submission and return success
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun 
    // - AWS SES
    // - Netlify's built-in email notifications
    
    console.log('Template Request:', {
      firstName,
      email,
      templateType,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Template request submitted successfully' 
      })
    };

  } catch (error) {
    console.error('Error processing template request:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function createEmailTemplate(firstName, templateType, template) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #5DADE2 0%, #76D7C4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px 20px; }
            .footer { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .tips { background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Your Tax Template is Ready!</h1>
                <p>Thanks ${firstName}! Here's your ${templateType}</p>
            </div>
            
            <div class="content">
                <h2>📊 What You're Getting</h2>
                <div class="highlight">
                    <p><strong>${templateType}</strong></p>
                    <p>${template.description}</p>
                </div>
                
                <p>Hi ${firstName},</p>
                
                <p>Thanks for downloading our <strong>${templateType}</strong>! This professional-grade template will help you organize your tax records and maximize your deductions.</p>
                
                <div class="tips">
                    <h3>💡 Pro Tips for Using Your Template:</h3>
                    <ul>
                        <li><strong>Start Today:</strong> Begin tracking immediately - don't wait until tax season</li>
                        <li><strong>Stay Consistent:</strong> Update your records weekly for best results</li>
                        <li><strong>Keep Receipts:</strong> Always save receipts for audit protection</li>
                        <li><strong>Backup Data:</strong> Store copies in cloud storage for security</li>
                    </ul>
                </div>
                
                <h3>🚀 Want Even More Tax Help?</h3>
                <p>This template is just the beginning! For complete tax optimization, check out our <strong>Tax Fix Pack</strong> with advanced calculators, guides, and expert support.</p>
                
                <p style="text-align: center;">
                    <a href="https://taxtok.gumroad.com/l/okjyj" class="button">Get Complete Tax Fix Pack - $29</a>
                </p>
                
                <p>Questions? Reply to this email - we're here to help!</p>
                
                <p>Best regards,<br>
                The TaxFix Team<br>
                🎯 Keep More, Cry Less</p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 TaxFix. All rights reserved.</p>
                <p>Visit us at <a href="https://tax-fix.org" style="color: #5DADE2;">tax-fix.org</a></p>
            </div>
        </div>
    </body>
    </html>
  `;
}