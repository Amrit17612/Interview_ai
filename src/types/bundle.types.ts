export type BundleType = 'company' | 'domain';

export interface BundleMetadata {
  id: string;
  name: string;
  description: string;
  type: BundleType;
  category: string;
  price: number;
  originalPrice?: number;
  features: string[];
  interviewsCount: number;
  iconType: string;
  isPopular?: boolean;
}

export const MOCK_COMPANY_BUNDLES: BundleMetadata[] = [
  {
    id: 'comp_google_01',
    name: 'Google SWE Prep',
    description: 'Master the Google software engineering interview with real past questions and system design scenarios.',
    type: 'company',
    category: 'FAANG',
    price: 1, // TEMPORARY
    originalPrice: 99,
    features: [
      '15 Company-specific technical mocks',
      'Googlyness behavioral rounds',
      'System design evaluations',
      'Detailed rubric matching Google standards'
    ],
    interviewsCount: 15,
    iconType: 'google',
    isPopular: true
  },
  {
    id: 'comp_amazon_01',
    name: 'Amazon Leadership Pack',
    description: 'Strict adherence to the 16 Leadership Principles mixed with challenging system design rounds.',
    type: 'company',
    category: 'FAANG',
    price: 1, // TEMPORARY
    features: [
      '10 Leadership Principle focused mocks',
      'Bar-raiser simulation',
      'STAR method strict evaluation'
    ],
    interviewsCount: 12,
    iconType: 'amazon'
  },
  {
    id: 'comp_meta_01',
    name: 'Meta Hacker Bundle',
    description: 'Fast-paced algorithmic rounds and product-focused system design interviews tailored for Meta.',
    type: 'company',
    category: 'FAANG',
    price: 1, // TEMPORARY
    features: [
      '12 Fast-paced algorithmic mocks',
      'Product architecture rounds',
      'Behavioral evaluation'
    ],
    interviewsCount: 12,
    iconType: 'meta'
  }
];

export const MOCK_DOMAIN_BUNDLES: BundleMetadata[] = [
  {
    id: 'dom_frontend_01',
    name: 'Senior Frontend Engineer',
    description: 'Deep dive into React, performance optimization, web vitals, and frontend system design.',
    type: 'domain',
    category: 'Engineering',
    price: 1, // TEMPORARY
    features: [
      'React & State Management mocks',
      'Web Performance & Vitals',
      'Frontend System Design',
      'CSS & UI component architecture'
    ],
    interviewsCount: 10,
    iconType: 'frontend',
    isPopular: true
  },
  {
    id: 'dom_backend_01',
    name: 'Backend Scale & Systems',
    description: 'Microservices, database scaling, caching strategies, and distributed systems architecture.',
    type: 'domain',
    category: 'Engineering',
    price: 1, // TEMPORARY
    originalPrice: 79,
    features: [
      'Microservices architecture',
      'Database sharding & scaling',
      'Concurrency & multithreading',
      'API design and rate limiting'
    ],
    interviewsCount: 12,
    iconType: 'backend'
  },
  {
    id: 'dom_pm_01',
    name: 'Product Manager Masterclass',
    description: 'Product sense, execution, metrics, and behavioral scenarios for PM roles.',
    type: 'domain',
    category: 'Product',
    price: 1, // TEMPORARY
    features: [
      'Product Sense & Strategy',
      'Execution & Metrics',
      'Cross-functional collaboration',
      'Case studies'
    ],
    interviewsCount: 8,
    iconType: 'product'
  }
];
