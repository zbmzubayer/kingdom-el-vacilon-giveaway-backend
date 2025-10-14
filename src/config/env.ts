import 'dotenv/config';

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  CLIENT_URL: string;
  GHL_URL: string;
  PUBLIC_API_TOKEN: string;
  JWT_SECRET: string;
  ADMIN_BASIC_AUTH_PASSWORD: string;
}

export const ENV: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  GHL_URL: process.env.GHL_URL || '',
  PUBLIC_API_TOKEN: process.env.PUBLIC_API_TOKEN || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  ADMIN_BASIC_AUTH_PASSWORD: process.env.ADMIN_BASIC_AUTH_PASSWORD || '',
};
