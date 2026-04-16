/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Railway's internal domains for images if needed
  images: {
    remotePatterns: [],
  },
  // Ensure server-side env vars are available
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    N8N_SETUP_URL: process.env.N8N_SETUP_URL,
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
    EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
  },
};

export default nextConfig;
