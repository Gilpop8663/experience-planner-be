export interface MailModuleOptions {
  apiKey: string;
  domain: string;
  fromEmail: string;
}

export type MailTemplate = 'verify-email' | 'reset-password';

export interface EmailVar {
  key: string;
  value: string;
}
