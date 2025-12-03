/**
 * Footer Component
 * 
 * Barcha sahifalarda ko'rinadigan footer (login dan tashqari)
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C2C30] py-3 px-4 md:px-6 mt-auto">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="font-medium">
              &copy; {currentYear} Vegas CRM • Xorazm, O'zbekiston
            </p>
          </div>

          {/* Version */}
          <div className="text-center">
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

