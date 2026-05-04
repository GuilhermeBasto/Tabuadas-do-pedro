import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/root";

import "./app.css";
// Side-effect import: registers the beforeinstallprompt listener at module
// load time so the (single-shot) event is captured before any component mounts.
import "~/lib/installPrompt";

export const meta: MetaFunction = () => [
  { title: "Tabuadas do Pedro 🎮" },
  {
    name: "description",
    content: "Aprende as tabuadas a jogar! Aventura, treino e boss fights.",
  },
  { name: "theme-color", content: "#1a1a2e" },
  { name: "mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  { name: "apple-mobile-web-app-title", content: "Tabuadas do Pedro" },
  {
    name: "viewport",
    content:
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
  },
];

export const links: LinksFunction = () => [
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/icon-192.png" },
  { rel: "apple-touch-icon", href: "/icon-192.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fredoka:wght@500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <BackgroundStars />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (window.location.protocol === "file:") return;

    if (import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    } else {
      // In dev, the SW caches Vite chunks that change on every restart, which
      // produces "two copies of React" / null `useContext` errors. Make sure
      // any previously-registered SW is gone and its caches are cleared.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    }
  }, []);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Erro inesperado";
  let details = "Algo correu mal. Tenta recarregar a página.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Página não encontrada" : "Erro " + error.status;
    details = error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="pixel-card max-w-md p-8 text-center">
        <div className="mb-4 text-6xl">😵</div>
        <h1 className="mb-3 font-[family-name:var(--font-pixel)] text-xl text-pixel-gold text-shadow-pixel">
          {message}
        </h1>
        <p className="text-sm opacity-80">{details}</p>
      </div>
    </main>
  );
}

/* ============================================================
   Decorative twinkling stars in the background.
   Rendered once at the body level so all routes share it.
   ============================================================ */
function BackgroundStars() {
  // Pre-computed positions so SSR and client render identically.
  const stars = Array.from({ length: 40 }, (_, i) => {
    // Deterministic pseudo-random — no hydration mismatch
    const seed = i * 9301 + 49297;
    const x = ((seed % 233280) / 233280) * 100;
    const y = (((seed * 7) % 233280) / 233280) * 100;
    const delay = (((seed * 3) % 233280) / 233280) * 3;
    const opacity = 0.2 + (((seed * 11) % 100) / 100) * 0.6;
    return { x, y, delay, opacity };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}
