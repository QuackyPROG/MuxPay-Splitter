import type { Metadata } from 'next';
import RunPageClient from './RunPageClient';

export const metadata: Metadata = {
  title: 'Run Payroll — MuxPay',
};

export default function RunPage() {
  return <RunPageClient />;
}
