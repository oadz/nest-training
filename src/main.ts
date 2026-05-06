import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('The Task API description')
    .setVersion('1.0')
    // .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // for setup url (localhost:3000/docs) and documentFactory
  SwaggerModule.setup('docs', app, documentFactory);
  await app.listen(3000);
}
bootstrap();
