import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions, MailTemplate } from './mail.interfaces';
import fetch from 'node-fetch';
import { logErrorAndReturnFalse } from 'src/utils';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail({
    to,
    subject,
    emailVars,
    template,
  }: {
    to: string;
    subject: string;
    template: MailTemplate;
    emailVars: EmailVar[];
  }) {
    try {
      const form = new FormData();

      form.append('from', `Excited User <mailgun@${this.options.domain}>`);
      form.append('to', `${to}`);
      form.append('subject', `${subject}`);
      form.append('template', template);
      emailVars.forEach((emailVar) => {
        form.append(`v:${emailVar.key}`, emailVar.value);
      });

      await fetch(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
    } catch (error) {
      logErrorAndReturnFalse(error, '이메일 전송에 실패했습니다.');
    }
  }

  sendVerificationEmail({
    email,
    nickname,
    code,
  }: {
    email: string;
    nickname: string;
    code: string;
  }) {
    this.sendEmail({
      to: email,
      template: 'verify-email',
      subject: '[당신의 불행을 삽니다] 이메일 인증이 도착했습니다.',
      emailVars: [
        { key: 'code', value: code },
        { key: 'nickname', value: nickname },
      ],
    });
  }

  sendResetPasswordEmail({
    email,
    nickname,
    code,
  }: {
    email: string;
    nickname: string;
    code: string;
  }) {
    this.sendEmail({
      to: email,
      template: 'reset-password',
      subject: '[당신의 불행을 삽니다] 비밀번호 재설정 링크가 도착했습니다.',
      emailVars: [
        { key: 'code', value: code },
        { key: 'nickname', value: nickname },
      ],
    });
  }
}
