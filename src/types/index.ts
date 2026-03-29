export interface BusinessProfile {
  companyName: string;
  ownerName: string;
  role: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  vatNumber: string;
  bankDetails: string;
  customInstructions: string;
}

export interface QuoteRequest {
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  requestDescription: string;
  outputFormat: 'pdf' | 'email' | 'both';
  language: string;
  tone: 'formale' | 'semi-formale' | 'informale';
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface GeneratedQuote {
  id: string;
  createdAt: string;
  clientName: string;
  clientCompany: string;
  subject: string;
  introduction: string;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  terms: string;
  validity: string;
  notes: string;
  emailBody: string;
  htmlContent: string;
  usage?: TokenUsage;
}

export interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
  history: UsageEntry[];
}

export interface UsageEntry {
  date: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}
