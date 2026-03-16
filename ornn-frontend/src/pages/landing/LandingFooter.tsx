/**
 * Landing Page Footer Component.
 * Simple centered footer with copyright and glass morphism top border.
 * @module pages/landing/LandingFooter
 */

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neon-cyan/10 px-4 py-8">
      <div className="max-w-[1280px] mx-auto text-center">
        <p className="font-body text-sm text-text-muted">
          {year} Ornn. All rights reserved.
        </p>
        <p className="font-body text-xs text-text-muted/50 mt-1">
          v{__APP_VERSION__}
        </p>
      </div>
    </footer>
  );
}
