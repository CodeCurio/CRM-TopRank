export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSecondsToHM(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function formatSecondsDigital(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getDaysUntilDue(dueDateStr: string): number {
  const today = new Date('2026-07-31'); // fixed reference date to match system current time context
  const due = new Date(dueDateStr);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getInvoiceUrgency(dueDateStr: string, status: string): 'OVERDUE' | 'DUE_SOON' | 'NORMAL' {
  if (status === 'Paid') return 'NORMAL';
  const days = getDaysUntilDue(dueDateStr);
  if (days < 0 || status === 'Overdue') return 'OVERDUE';
  if (days <= 3) return 'DUE_SOON';
  return 'NORMAL';
}
