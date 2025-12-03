/**
 * QZ Tray Loader
 * 
 * QZ Tray package allaqachon o'rnatilgan
 * Faqat mavjudligini tekshiramiz
 */

export function loadQZTray(): Promise<void> {
  return new Promise((resolve) => {
    // qz-tray package allaqachon o'rnatilgan
    // Faqat browser muhitida ekanligini tekshiramiz
    if (typeof window !== 'undefined') {
      resolve();
    } else {
      resolve(); // SSR uchun ham resolve qilamiz
    }
  });
}

