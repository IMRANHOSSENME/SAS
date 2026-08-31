import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('SmartBio API v1')
    .setDescription('Smart Student Attendance System — Full API Documentation')
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication & JWT')
    .addTag('Users', 'Student & User management')
    .addTag('Devices', 'ESP8266 device management')
    .addTag('Biometrics', 'Fingerprint records')
    .addTag('Biometric Jobs', 'Enrollment & Update jobs')
    .addTag('Attendance', 'Attendance records & sessions')
    .addTag('Departments')
    .addTag('Batches')
    .addTag('Sections')
    .addTag('Teachers')
    .addTag('Courses')
    .addTag('Enrollments')
    .addTag('Schedules')
    .addTag('Attendance Policies')
    .addTag('Dashboard')
    .addTag('Reports')
    .addTag('Audit')
    .addTag('Settings')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 SmartBio API running on: http://localhost:${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
