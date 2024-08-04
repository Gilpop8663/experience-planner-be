import * as jwt from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  sign(payload: object, options?: jwt.SignOptions) {
    return jwt.sign(payload, this.options.secretKey, options);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.secretKey);
  }
}
