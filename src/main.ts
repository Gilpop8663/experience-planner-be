import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*', // 클라이언트의 origin을 여기에 설정
    credentials: true, // 인증 정보를 전달할 수 있도록 설정 (옵션)
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
