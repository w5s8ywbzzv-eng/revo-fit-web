/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA: manifest.json and sw.js are served as static files from /public.
  // Service worker registration happens client-side (see src/components/ServiceWorkerRegister.tsx).
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" }
        ]
      }
    ];
  }
};

export default nextConfig;
