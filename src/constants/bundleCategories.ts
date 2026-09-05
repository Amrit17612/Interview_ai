export interface CategoryOption {
  value: string;
  label: string;
}

export const COMPANY_BUNDLE_CATEGORIES: CategoryOption[] = [
  { value: 'FAANG', label: 'FAANG' },
  { value: 'FAANG_PLUS', label: 'FAANG+' },
  { value: 'PRODUCT_BASED', label: 'Product-Based' },
  { value: 'SERVICE_BASED', label: 'Service-Based' },
  { value: 'FINTECH', label: 'FinTech' },
  { value: 'BANKING', label: 'Banking' },
  { value: 'E_COMMERCE', label: 'E-Commerce' },
  { value: 'IT_SERVICES', label: 'IT Services' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'STARTUP', label: 'Startup' },
  { value: 'SAAS', label: 'SaaS' },
  { value: 'CLOUD_INFRASTRUCTURE', label: 'Cloud & Infrastructure' },
  { value: 'AI_ML_COMPANIES', label: 'AI/ML Companies' },
  { value: 'DATA_ANALYTICS', label: 'Data & Analytics' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'OTHER', label: 'Other' },
];

export const DOMAIN_BUNDLE_CATEGORIES: CategoryOption[] = [
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'DSA', label: 'Data Structures & Algorithms' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'BACKEND_DEVELOPMENT', label: 'Backend Development' },
  { value: 'FRONTEND_DEVELOPMENT', label: 'Frontend Development' },
  { value: 'FULL_STACK', label: 'Full Stack Development' },
  { value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development' },
  { value: 'AI_ML', label: 'AI & Machine Learning' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'DATA_ANALYTICS', label: 'Data Analytics' },
  { value: 'CLOUD_COMPUTING', label: 'Cloud Computing' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'PROGRAMMING_LANGUAGES', label: 'Programming Languages' },
  { value: 'TESTING_QA', label: 'Testing & QA' },
  { value: 'PRODUCT_MANAGEMENT', label: 'Product Management' },
  { value: 'OTHER', label: 'Other' },
];

export const getCategoryOptions = (type: 'COMPANY' | 'DOMAIN'): CategoryOption[] => {
  return type === 'COMPANY' ? COMPANY_BUNDLE_CATEGORIES : DOMAIN_BUNDLE_CATEGORIES;
};

export const getCategoryLabel = (type: 'COMPANY' | 'DOMAIN', value: string | undefined): string => {
  if (!value) return '';
  const options = getCategoryOptions(type);
  const found = options.find((opt) => opt.value === value);
  return found ? found.label : value; // Fallback to raw value for legacy records
};
