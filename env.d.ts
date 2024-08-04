declare module NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'dev' | 'test' | 'production';
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_DATABASE_NAME: string;
    DB_PASSWORD: string;
    JWT_SECRET_KEY: string;
    MAILGUN_API_KEY: string;
    MAILGUN_DOMAIN_NAME: string;
    MAILGUN_FROM_EMAIL: string;
    PORT: number;
    DATABASE_URL: string;
    SOLAPI_API_KEY: string;
    SOLAPI_API_SECRET_KEY: string;
  }
}
