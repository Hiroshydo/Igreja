import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Otimizações de Performance */
  compress: true,
  poweredByHeader: false,
  
  /* Imagens */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  /* Headers de Segurança */
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  /* Redirecionamentos */
  redirects: async () => {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },

  /* Variáveis de Ambiente */
  env: {
    NEXT_PUBLIC_APP_NAME: "Comunidade Viva",
  },
};

export default nextConfig;
