import { SetMetadata } from '@nestjs/common';

export const Admin = (...args: string[]) => SetMetadata('admin', args);
