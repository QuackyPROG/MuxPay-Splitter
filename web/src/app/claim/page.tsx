import type { Metadata } from 'next';
import ClaimPageClient from './ClaimPageClient';

export const metadata: Metadata = {
  title: 'Claim Payroll — MuxPay',
};

export default function ClaimPage() {
  return <ClaimPageClient />;
}
