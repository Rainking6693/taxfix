// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            if (mobileOverlay) {
                mobileOverlay.classList.toggle('active');
            }
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Homepage Calculator Widget
    const homepageCalculator = document.getElementById('homepage-calculator');
    if (homepageCalculator) {
        homepageCalculator.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const income = parseFloat(document.getElementById('widget-income').value) || 0;
            const type = document.getElementById('widget-type').value;
            
            if (income > 0 && type) {
                // Calculate potential savings based on work type
                let savingsRate = 0.15; // Default 15% savings rate
                
                switch(type) {
                    case 'rideshare':
                        savingsRate = 0.18;
                        break;
                    case 'delivery':
                        savingsRate = 0.17;
                        break;
                    case 'freelance':
                        savingsRate = 0.20;
                        break;
                    case 'ecommerce':
                        savingsRate = 0.22;
                        break;
                    case 'other':
                        savingsRate = 0.16;
                        break;
                }
                
                const potentialSavings = Math.round(income * savingsRate);
                
                // Show results
                const resultsDiv = document.getElementById('widget-results');
                const amountSpan = resultsDiv.querySelector('.result-amount');
                
                if (amountSpan) {
                    amountSpan.textContent = '$' + potentialSavings.toLocaleString();
                }
                
                resultsDiv.style.display = 'block';
                
                // Smooth scroll to results
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
    
    // Tax Calculator Page
    const taxCalculator = document.getElementById('tax-calculator');
    if (taxCalculator) {
        taxCalculator.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const income = parseFloat(document.getElementById('annual-income').value) || 0;
            const workType = document.getElementById('work-type').value;
            const currentDeductions = parseFloat(document.getElementById('current-deductions').value) || 0;
            
            if (income > 0 && workType) {
                // Calculate estimated taxes and potential savings
                const selfEmploymentTax = income * 0.9235 * 0.153;
                const federalTax = income * 0.22; // Simplified federal tax
                const totalTax = selfEmploymentTax + federalTax;
                
                // Calculate potential deductions based on work type
                let potentialDeductions = 0;
                switch(workType) {
                    case 'rideshare':
                        potentialDeductions = income * 0.30;
                        break;
                    case 'delivery':
                        potentialDeductions = income * 0.28;
                        break;
                    case 'freelance':
                        potentialDeductions = income * 0.25;
                        break;
                    case 'ecommerce':
                        potentialDeductions = income * 0.35;
                        break;
                    case 'consulting':
                        potentialDeductions = income * 0.20;
                        break;
                    default:
                        potentialDeductions = income * 0.22;
                }
                
                const missedDeductions = Math.max(0, potentialDeductions - currentDeductions);
                const potentialSavings = missedDeductions * 0.35; // Estimated tax rate on deductions
                
                // Show results
                const resultsDiv = document.getElementById('calculator-results');
                if (resultsDiv) {
                    document.getElementById('estimated-tax').textContent = '$' + Math.round(totalTax).toLocaleString();
                    document.getElementById('potential-deductions').textContent = '$' + Math.round(potentialDeductions).toLocaleString();
                    document.getElementById('missed-deductions').textContent = '$' + Math.round(missedDeductions).toLocaleString();
                    document.getElementById('potential-savings').textContent = '$' + Math.round(potentialSavings).toLocaleString();
                    
                    resultsDiv.style.display = 'block';
                    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    }
});