/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, format = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('en-PH');
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return d.toISOString().split('T')[0];
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}

export function calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function generateEmployeeNumber(tenantId: string, sequence: number): string {
  const year = new Date().getFullYear();
  const seq = sequence.toString().padStart(4, '0');
  return `${tenantId.substring(0, 3).toUpperCase()}-${year}-${seq}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getFullName(firstName: string, lastName: string, middleName?: string, suffix?: string): string {
  const parts = [firstName];
  if (middleName) parts.push(middleName);
  parts.push(lastName);
  if (suffix) parts.push(suffix);
  return parts.join(' ');
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+63|0)[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-neutral-100 text-neutral-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    present: 'bg-emerald-100 text-emerald-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-amber-100 text-amber-700',
    on_leave: 'bg-blue-100 text-blue-700',
    holiday: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    draft: 'bg-neutral-100 text-neutral-700',
    cancelled: 'bg-red-100 text-red-700',
    resigned: 'bg-neutral-100 text-neutral-700',
    terminated: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-neutral-100 text-neutral-700';
}
