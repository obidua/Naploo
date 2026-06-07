import { api } from '@/lib/api';

export interface Investor {
  id: string;
  userId: string;
  status: 'pending' | 'kyc_pending' | 'approved' | 'active' | 'suspended' | 'blocked';
  totalInvested: string;
  totalEarned: string;
  totalPodSets: number;
  approvedAt?: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  investorId: string;
  podSetId?: string;
  invoiceNumber: string;
  podSetCount: number;
  pricePerSet: string;
  gstAmount: string;
  totalAmount: string;
  deliveryOption: 'doorstep' | 'leaseback';
  guaranteeAmount: string;
  earnedSoFar: string;
  guaranteeReached: boolean;
  status: 'pending' | 'active' | 'completed' | 'refunded';
  contractStartDate?: string;
  contractEndDate?: string;
  createdAt: string;
}

export const investorApi = {
  // Status + my profile
  me: () => api.get<{ success: boolean; enrolled: boolean; investor: Investor | null; investments: Investment[] }>('/api/v1/investors/me'),

  // Enroll as investor
  enroll: () => api.post<{ success: boolean; investor: Investor; alreadyEnrolled?: boolean }>('/api/v1/investors/enroll', {}),

  // Create a new investment (claim pod sets)
  invest: (input: { podSetCount?: number; podSetId?: string; deliveryOption?: 'doorstep' | 'leaseback' }) =>
    api.post<{ success: boolean; investment: Investment }>('/api/v1/investors/invest', input),

  // Earnings for an investment
  earningsFor: (investmentId: string) =>
    api.get<{ success: boolean; count: number; earnings: any[] }>(`/api/v1/investors/investments/${investmentId}/earnings`),
};

export function formatMoney(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
