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

  /* Variáveis de Ambiente */
  env: {
    NEXT_PUBLIC_APP_NAME: "Ecclesia One",
  },
};

export default nextConfig;
