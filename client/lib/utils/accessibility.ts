/**
 * Accessibility Utilities
 * 
 * WCAG 2.1 AA standartlariga muvofiq
 */

/**
 * Keyboard event handler
 * Enter yoki Space bosilganda action bajarish
 */
export function handleKeyboardClick(
  event: React.KeyboardEvent,
  callback: () => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

/**
 * Focus trap for modals/dialogs
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique ID for ARIA labels
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Check if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Get ARIA label for status
 */
export function getStatusAriaLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Kutilmoqda',
    completed: 'Yakunlandi',
    cancelled: 'Bekor qilindi',
    pending: 'Jarayonda',
    success: 'Muvaffaqiyatli',
    error: 'Xatolik',
    warning: 'Ogohlantirish',
    info: 'Ma\'lumot',
  };

  return labels[status] || status;
}

