/**
 * Responsive Design Utilities
 * 
 * Mobile-first responsive design helpers
 */

/**
 * Breakpoints (Tailwind defaults)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Check if current viewport is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if current viewport is tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS | 'xs' {
  if (typeof window === 'undefined') return 'xs';

  const width = window.innerWidth;

  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Touch target size checker
 * Minimum 44x44px (WCAG 2.1 AA)
 */
export function isTouchTargetValid(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}

/**
 * Responsive grid columns calculator
 */
export function getGridColumns(
  breakpoint: keyof typeof BREAKPOINTS | 'xs',
  config: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  }
): number {
  return config[breakpoint] || config.xs || 1;
}

/**
 * Responsive font size
 */
export function getResponsiveFontSize(
  base: number,
  scale: { mobile?: number; tablet?: number; desktop?: number } = {}
): string {
  const { mobile = 0.875, tablet = 1, desktop = 1 } = scale;

  if (isMobile()) return `${base * mobile}rem`;
  if (isTablet()) return `${base * tablet}rem`;
  return `${base * desktop}rem`;
}

/**
 * Safe area insets for mobile devices (notch, home indicator)
 */
export const SAFE_AREA_INSETS = {
  top: 'env(safe-area-inset-top, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
} as const;

/**
 * Prevent body scroll (for modals)
 */
export function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${getScrollbarWidth()}px`;
}

/**
 * Enable body scroll
 */
export function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Get scrollbar width
 */
export function getScrollbarWidth(): number {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

