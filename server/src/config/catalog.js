const TRUSTED_CATALOG = {
  // TEMPORARY LIVE PAYMENT TEST PRICE - RESTORE ORIGINAL PRICES BEFORE LAUNCH
  // Company Bundles
  comp_google_01: {
    bundleId: 'comp_google_01',
    bundleType: 'COMPANY',
    title: 'Google SWE Prep',
    description: 'Master the Google software engineering interview with real past questions and system design scenarios.',
    amount: 100, // Amount in paise (1 INR) - TEMPORARY
    currency: 'INR',
    active: true
  },
  comp_amazon_01: {
    bundleId: 'comp_amazon_01',
    bundleType: 'COMPANY',
    title: 'Amazon Leadership Pack',
    description: 'Strict adherence to the 16 Leadership Principles mixed with challenging system design rounds.',
    amount: 100, // TEMPORARY 
    currency: 'INR',
    active: true
  },
  comp_meta_01: {
    bundleId: 'comp_meta_01',
    bundleType: 'COMPANY',
    title: 'Meta Hacker Bundle',
    description: 'Fast-paced algorithmic rounds and product-focused system design interviews tailored for Meta.',
    amount: 100, // TEMPORARY
    currency: 'INR',
    active: true
  },

  // Domain Bundles
  dom_frontend_01: {
    bundleId: 'dom_frontend_01',
    bundleType: 'DOMAIN',
    title: 'Senior Frontend Engineer',
    description: 'Deep dive into React, performance optimization, web vitals, and frontend system design.',
    amount: 100, // TEMPORARY
    currency: 'INR',
    active: true
  },
  dom_backend_01: {
    bundleId: 'dom_backend_01',
    bundleType: 'DOMAIN',
    title: 'Backend Scale & Systems',
    description: 'Microservices, database scaling, caching strategies, and distributed systems architecture.',
    amount: 100, // TEMPORARY
    currency: 'INR',
    active: true
  },
  dom_pm_01: {
    bundleId: 'dom_pm_01',
    bundleType: 'DOMAIN',
    title: 'Product Manager Masterclass',
    description: 'Product sense, execution, metrics, and behavioral scenarios for PM roles.',
    amount: 100, // TEMPORARY
    currency: 'INR',
    active: true
  }
};

module.exports = TRUSTED_CATALOG;
