import type { Config } from "@react-router/dev/config";

export default {
  // PWA cliente-side: sem SSR para podermos fazer deploy em qualquer static host
  // (Netlify, GitHub Pages, Cloudflare Pages, etc.)
  ssr: false,
} satisfies Config;
