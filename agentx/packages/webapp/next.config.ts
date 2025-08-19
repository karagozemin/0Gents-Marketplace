import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Load root .env into process before Next reads env
// Now .env is at agentx/.env relative to webapp package
dotenv.config({ path: path.join(process.cwd(), "../.env") });

const nextConfig: NextConfig = {
  /* other config */
};

export default nextConfig;
