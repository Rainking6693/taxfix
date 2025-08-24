// Netlify Function to send welcome emails after Hidden Profit Finder submission
// This function is triggered automatically when the form is submitted

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
            email: formData.get('email'),
            businessType: formData.get('businessType'),
            incomeRange: formData.get('incomeRange'),
            trackExpenses: formData.get('trackExpenses'),
            expenseTrackingMethod: formData.get('expenseTrackingMethod'),
            businessStructure: formData.get('businessStructure'),
            workState: formData.get('workState'),
            timestamp: new Date().toISOString()
        };
        
        console.log('Parsed user data:', userData);

        // Validate required fields
        if (!userData.email || !userData.businessType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Generate personalized email content
        const emailContent = generatePersonalizedEmail(userData);

        // Send email using Resend API (free tier: 3000 emails/month)
        const emailResult = await sendEmail(userData.email, emailContent);

        // Also send notification to admin
        await sendAdminNotification(userData);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Email sent successfully',
                emailId: emailResult.id 
            })
        };

    } catch (error) {
        console.error('Email sending error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to send email', 
                details: error.message 
            })
        };
    }
};

// Send email using Resend API
async function sendEmail(recipientEmail, content) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable not set');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'TaxFix <onboarding@resend.dev>',
            to: [recipientEmail],
            subject: 'Your Hidden Profit Finder Results - TaxFix',
            html: content.html,
            text: content.text,
            reply_to: 'hello@tax-fix.org'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email API error: ${error}`);
    }

    return await response.json();
}

// Send admin notification
async function sendAdminNotification(userData) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@tax-fix.org';

    if (!RESEND_API_KEY) return; // Skip if not configured

    const adminContent = `
        <h2>New Hidden Profit Finder Submission</h2>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Business Type:</strong> ${userData.businessType}</p>
        <p><strong>Income Range:</strong> ${userData.incomeRange}</p>
        <p><strong>Tracks Expenses:</strong> ${userData.trackExpenses}</p>
        <p><strong>Tracking Method:</strong> ${userData.expenseTrackingMethod}</p>
        <p><strong>Business Structure:</strong> ${userData.businessStructure}</p>
        <p><strong>State:</strong> ${userData.workState}</p>
        <p><strong>Timestamp:</strong> ${userData.timestamp}</p>
        
        <hr>
        <p>View all submissions in your <a href="https://app.netlify.com/projects/taxtok-website/forms">Netlify Dashboard</a></p>
    `;

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'TaxFix Forms <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: `New Lead: ${userData.businessType} from ${userData.workState}`,
            html: adminContent,
            reply_to: 'hello@tax-fix.org'
        })
    });
}

// Generate personalized email content
function generatePersonalizedEmail(userData) {
    const businessTypeText = {
        'uber-lyft': 'Uber/Lyft driving',
        'doordash': 'DoorDash delivery',
        'freelancer': 'freelancing',
        'etsy': 'Etsy selling',
        'airbnb': 'Airbnb hosting',
        'instacart': 'Instacart shopping',
        'content-creator': 'content creation',
        'other': 'gig work'
    };

    const incomeText = {
        '0-1000': 'under $1,000/month',
        '1000-3000': '$1,000-$3,000/month',
        '3000-5000': '$3,000-$5,000/month',
        '5000-10000': '$5,000-$10,000/month',
        '10000+': 'over $10,000/month'
    };

    // Calculate estimated savings
    const savingsEstimate = calculateSavings(userData.incomeRange, userData.trackExpenses);

    // Generate business-specific deductions
    const deductions = getBusinessDeductions(userData.businessType);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Hidden Profit Finder Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #5DADE2 0%, #76D7C4 100%); color: white; padding: 2rem; text-align: center; }
        .header h1 { margin: 0; font-size: 1.8rem; font-weight: 700; }
        .content { padding: 2rem; }
        .savings-highlight { background: linear-gradient(135deg, #059669 0%, #34d399 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center; margin-bottom: 2rem; }
        .savings-amount { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; }
        .deduction-item { background: #f8fafc; border-left: 4px solid #5DADE2; padding: 1rem; margin-bottom: 1rem; border-radius: 0 4px 4px 0; }
        .deduction-name { font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
        .deduction-savings { color: #059669; font-weight: 700; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #34d399 100%); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 6px; font-weight: 700; margin: 1rem 0; }
        .footer { background: #f8fafc; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem; }
        .footer a { color: #5DADE2; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your Hidden Profit Finder Results</h1>
            <p>Personalized tax deductions for your ${businessTypeText[userData.businessType] || 'business'}</p>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>Thanks for using our Hidden Profit Finder! Based on your ${businessTypeText[userData.businessType] || 'gig work'} earning ${incomeText[userData.incomeRange] || 'income'} in ${userData.workState || 'your state'}, here are the deductions you might be missing:</p>
            
            <div class="savings-highlight">
                <div class="savings-amount">$${savingsEstimate.toLocaleString()}</div>
                <div>Estimated Annual Tax Savings</div>
            </div>
            
            <h3>Key Deductions for Your Business:</h3>
            
            ${deductions.map(deduction => `
                <div class="deduction-item">
                    <div class="deduction-name">${deduction.name}</div>
                    <div class="deduction-savings">Potential savings: ${deduction.savings}</div>
                </div>
            `).join('')}
            
            <h3>Next Steps:</h3>
            <ol>
                <li><strong>Start tracking immediately</strong> - Focus on your biggest deductions first</li>
                <li><strong>Save all receipts</strong> for business-related expenses</li>
                <li><strong>Consider your business structure</strong> - ${getStructureAdvice(userData.businessStructure)}</li>
                <li><strong>Set up quarterly payments</strong> to avoid tax penalties</li>
            </ol>
            
            <p style="text-align: center;">
                <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3Nqqg0NeTvGbTzo7olP5axJbp2FdtPGA9kzIeB0i-70EF5uo6Qy3kVj7vipm_3W9azofrf5_Kh" class="cta-button">
                    Book Your Free Tax Consultation
                </a>
            </p>
            
            <p><strong>Want personalized help?</strong> Schedule a free 15-minute consultation to discuss your specific situation and get expert guidance on maximizing your deductions.</p>
            
            <p>Best regards,<br>
            The TaxFix Team</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0;">
            
            <p style="font-size: 0.9rem; color: #6b7280;">
                P.S. Keep this email handy during tax season! These deductions could save you hundreds or thousands on your tax bill.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>TaxFix</strong> - Helping gig workers keep more of what they earn</p>
            <p>Visit us: <a href="https://tax-fix.org">tax-fix.org</a> | Questions: hello@tax-fix.org</p>
            
            <p style="font-size: 0.8rem; margin-top: 1rem;">
                This email was sent because you used our Hidden Profit Finder tool.<br>
                <a href="mailto:hello@tax-fix.org?subject=Unsubscribe">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Hi there!

Thanks for using our Hidden Profit Finder! Based on your ${businessTypeText[userData.businessType] || 'gig work'} earning ${incomeText[userData.incomeRange] || 'income'} in ${userData.workState || 'your state'}, here are your personalized tax optimization opportunities.

ESTIMATED ANNUAL SAVINGS: $${savingsEstimate.toLocaleString()}

KEY DEDUCTIONS FOR YOUR BUSINESS:
${deductions.map(d => `• ${d.name} - ${d.savings}`).join('\n')}

NEXT STEPS:
1. Start tracking immediately - Focus on your biggest deductions first
2. Save all receipts for business-related expenses  
3. Consider your business structure - ${getStructureAdvice(userData.businessStructure)}
4. Set up quarterly payments to avoid tax penalties

Ready for personalized help? Book a free consultation: https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3Nqqg0NeTvGbTzo7olP5axJbp2FdtPGA9kzIeB0i-70EF5uo6Qy3kVj7vipm_3W9azofrf5_Kh

Best regards,
The TaxFix Team

---
TaxFix - Helping gig workers keep more of what they earn
Visit: https://tax-fix.org | Questions: hello@tax-fix.org

P.S. Keep this email handy during tax season! These deductions could save you hundreds or thousands on your tax bill.
`;

    return { html, text };
}

// Calculate realistic savings estimate
function calculateSavings(incomeRange, trackExpenses) {
    const baseSavings = {
        '0-1000': 600,
        '1000-3000': 900,
        '3000-5000': 1200,
        '5000-10000': 1600,
        '10000+': 2000
    };

    let savings = baseSavings[incomeRange] || 1200;

    // Adjust based on tracking habits
    if (trackExpenses === 'no') {
        savings = Math.round(savings * 1.4); // More savings potential
    } else if (trackExpenses === 'sometimes') {
        savings = Math.round(savings * 1.2);
    }

    return savings;
}

// Get business-specific deductions
function getBusinessDeductions(businessType) {
    const deductions = {
        'uber-lyft': [
            { name: 'Vehicle Mileage (67¢ per mile)', savings: '$200-400/month' },
            { name: 'Phone Bill (Business Portion)', savings: '$30-50/month' },
            { name: 'Car Maintenance & Repairs', savings: '$50-150/month' },
            { name: 'Car Washes & Detailing', savings: '$20-40/month' },
            { name: 'Tolls & Parking Fees', savings: '$20-60/month' }
        ],
        'doordash': [
            { name: 'Vehicle Expenses or Mileage', savings: '$150-300/month' },
            { name: 'Hot Bags & Delivery Equipment', savings: '$10-20/month' },
            { name: 'Phone & Data Plan', savings: '$40-60/month' },
            { name: 'Parking & Tolls', savings: '$20-50/month' },
            { name: 'Car Supplies & Maintenance', savings: '$30-80/month' }
        ],
        'freelancer': [
            { name: 'Home Office Deduction', savings: '$100-300/month' },
            { name: 'Software Subscriptions', savings: '$50-150/month' },
            { name: 'Internet & Phone Bills', savings: '$40-80/month' },
            { name: 'Professional Development', savings: '$30-100/month' },
            { name: 'Equipment & Supplies', savings: '$25-75/month' }
        ],
        'etsy': [
            { name: 'Materials & Supplies', savings: '$100-250/month' },
            { name: 'Shipping & Packaging', savings: '$50-150/month' },
            { name: 'Home Office/Studio Space', savings: '$75-200/month' },
            { name: 'Marketplace & Processing Fees', savings: '$40-100/month' },
            { name: 'Equipment & Tools', savings: '$30-80/month' }
        ]
    };

    return deductions[businessType] || [
        { name: 'Business Mileage', savings: '$100-200/month' },
        { name: 'Home Office Expenses', savings: '$50-150/month' },
        { name: 'Equipment & Supplies', savings: '$30-80/month' },
        { name: 'Professional Services', savings: '$25-50/month' }
    ];
}

// Get business structure advice
function getStructureAdvice(structure) {
    const advice = {
        'sole-proprietor': 'An LLC could provide liability protection and potential tax benefits',
        'llc': 'Consider S-Corp election if your income is growing significantly',
        's-corp': 'Optimize your salary vs distribution ratio for maximum tax efficiency',
        'not-sure': 'Start with sole proprietorship, then consider LLC as you grow'
    };

    return advice[structure] || 'Consult a tax professional about the best structure for your situation';
}