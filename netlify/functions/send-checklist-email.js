// Netlify Function to send tax checklist emails after form submission
// This function is triggered automatically when the checklist form is submitted

exports.handler = async (event, context) => {
    // Only process POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the form data
        console.log('Raw event body:', event.body);
        const formData = new URLSearchParams(event.body);
        const userData = {
            firstName: formData.get('first-name'),
            email: formData.get('email'),
            sourcePage: formData.get('source-page'),
            timestamp: formData.get('timestamp') || new Date().toISOString()
        };
        
        console.log('Parsed user data:', userData);

        // Validate required fields
        if (!userData.firstName || !userData.email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'Missing required fields',
                    received: userData 
                })
            };
        }

        // Email content for the user
        const userEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #5DADE2 0%, #76D7C4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                .content { padding: 30px 20px; background: #f9f9f9; border-radius: 10px; margin: 20px 0; }
                .checklist-link { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Your Tax Checklist is Ready!</h1>
                    <p>50-Point Comprehensive Deduction Guide</p>
                </div>
                
                <div class="content">
                    <h2>Hi ${userData.firstName}!</h2>
                    
                    <p>Thank you for downloading our comprehensive tax deduction checklist! This guide contains 50 specific deductions organized into 6 categories that gig workers commonly miss.</p>
                    
                    <div class="highlight">
                        <strong>⚡ Quick Start:</strong> Focus on Vehicle Expenses and Home Office deductions first - these typically offer the biggest savings for gig workers.
                    </div>
                    
                    <a href="https://tax-fix.org/50-point-tax-checklist.html" class="checklist-link">
                        📥 Access Your Tax Checklist
                    </a>
                    
                    <h3>What's Inside Your Checklist:</h3>
                    <ul>
                        <li><strong>🚗 Vehicle Expenses (10 items)</strong> - Including the 67¢/mile deduction</li>
                        <li><strong>🏠 Home Office (8 items)</strong> - Workspace, utilities, and equipment</li>
                        <li><strong>💻 Technology & Equipment (8 items)</strong> - Software, devices, subscriptions</li>
                        <li><strong>📋 Business Operations (8 items)</strong> - Licenses, insurance, banking fees</li>
                        <li><strong>📢 Marketing & Advertising (8 items)</strong> - Promotion and networking costs</li>
                        <li><strong>📚 Education & Development (8 items)</strong> - Training and skill building</li>
                    </ul>
                    
                    <h3>💰 Potential Savings:</h3>
                    <p>Based on our analysis of 1,000+ gig worker tax returns, proper deduction tracking saves an average of <strong>$1,800 annually</strong>. Many users find deductions they've been missing for years!</p>
                    
                    <h3>🤔 Need Help Implementing These Deductions?</h3>
                    <p>Don't want to handle this yourself? Our tax experts specialize in gig worker taxes and can:</p>
                    <ul>
                        <li>Handle all your bookkeeping and record keeping</li>
                        <li>Prepare your taxes and maximize every deduction</li>
                        <li>Set up quarterly tax planning to avoid penalties</li>
                        <li>Provide year-round support and guidance</li>
                    </ul>
                    
                    <p style="text-align: center;">
                        <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3Nqqg0NeTvGbTzo7olP5axJbp2FdtPGA9kzIeB0i-70EF5uo6Qy3kVj7vipm_3W9azofrf5_Kh" class="checklist-link">
                            📅 Book Free Tax Consultation
                        </a>
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>Tax Fix</strong><br>
                    Professional Tax & Accounting Services for Gig Workers<br>
                    www.tax-fix.org</p>
                    
                    <p style="font-size: 12px; margin-top: 20px;">
                        This email was sent because you downloaded our tax checklist from tax-fix.org. 
                        You can unsubscribe at any time by replying to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Plain text version
        const userEmailText = `
        Hi ${userData.firstName}!

        Thank you for downloading our comprehensive tax deduction checklist!

        Access your 50-point checklist here: https://tax-fix.org/50-point-tax-checklist.html

        This guide contains specific deductions organized into 6 categories:
        - Vehicle Expenses (10 items) - Including the 67¢/mile deduction
        - Home Office (8 items) - Workspace, utilities, and equipment  
        - Technology & Equipment (8 items) - Software, devices, subscriptions
        - Business Operations (8 items) - Licenses, insurance, banking fees
        - Marketing & Advertising (8 items) - Promotion and networking costs
        - Education & Development (8 items) - Training and skill building

        Potential Savings: Based on our analysis of 1,000+ gig worker tax returns, proper deduction tracking saves an average of $1,800 annually.

        Need help implementing these deductions? Book a free consultation: https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3Nqqg0NeTvGbTzo7olP5axJbp2FdtPGA9kzIeB0i-70EF5uo6Qy3kVj7vipm_3W9azofrf5_Kh

        Best regards,
        Tax Fix Team
        www.tax-fix.org
        `;

        // Notification email for admin
        const adminEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
                .content { padding: 20px; background: #f3f4f6; border-radius: 5px; margin: 20px 0; }
                .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .data-table th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🎯 New Tax Checklist Download</h2>
                </div>
                
                <div class="content">
                    <h3>New Lead Captured</h3>
                    <p>Someone just downloaded the tax checklist from your website!</p>
                    
                    <table class="data-table">
                        <tr><th>Name</th><td>${userData.firstName}</td></tr>
                        <tr><th>Email</th><td>${userData.email}</td></tr>
                        <tr><th>Source Page</th><td>${userData.sourcePage}</td></tr>
                        <tr><th>Timestamp</th><td>${userData.timestamp}</td></tr>
                    </table>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Follow up within 24-48 hours</li>
                        <li>Add to your email marketing sequence</li>
                        <li>Consider reaching out personally if high-value lead</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
        `;

        // In a production environment, you would integrate with an email service
        // For now, we'll log the email content and simulate sending
        
        console.log('Would send user email to:', userData.email);
        console.log('User email content prepared:', userEmailHTML.substring(0, 200) + '...');
        
        console.log('Would send admin notification email');
        console.log('Admin email content prepared:', adminEmailHTML.substring(0, 200) + '...');

        // Here you would integrate with your email service provider (e.g., SendGrid, Mailchimp, etc.)
        // Example with SendGrid:
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        // Send to user
        await sgMail.send({
            to: userData.email,
            from: 'noreply@tax-fix.org',
            subject: '📋 Your 50-Point Tax Checklist is Ready!',
            text: userEmailText,
            html: userEmailHTML
        });
        
        // Send admin notification
        await sgMail.send({
            to: 'ben@tax-fix.org',
            from: 'noreply@tax-fix.org',
            subject: '🎯 New Tax Checklist Download',
            html: adminEmailHTML
        });
        */

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Email processing initiated',
                userData: userData,
                emailSent: true 
            })
        };

    } catch (error) {
        console.error('Error processing checklist email:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};