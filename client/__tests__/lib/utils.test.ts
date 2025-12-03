/**
 * Utils Tests
 */

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
  });

  it('should handle undefined and null', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });
});

describe('formatCurrency', () => {
  it('should format UZS currency correctly', () => {
    expect(formatCurrency(1000000)).toBe('1,000,000 so\'m');
  });

  it('should format USD currency correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('0 so\'m');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-1,000 so\'m');
  });
});

