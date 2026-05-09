/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    INDEXER_URL: process.env.INDEXER_URL ?? "https://api.thegraph.com/subgraphs/name/drips/waves",
    DRIPS_WAVE_API: process.env.DRIPS_WAVE_API ?? "https://api.drips.network/waves",
  },
};

module.exports = nextConfig;
