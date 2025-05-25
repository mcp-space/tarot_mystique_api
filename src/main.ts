import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import * as helmet from 'helmet'
import * as compression from 'compression'
import { AppModule } from './app.module'

// 🔮 The Gateway to Ancient Wisdom
async function bootstrap() {
  const logger = new Logger('Bootstrap')
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    })
    
    const configService = app.get(ConfigService)
    const port = configService.get<number>('PORT', 3000)
    const nodeEnv = configService.get<string>('NODE_ENV', 'development')
    
    // 🛡️ Security & Performance Middleware
    app.use(helmet())
    app.use(compression())
    
    // 🌐 CORS Configuration
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
    
    // 🔍 Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    
    // 🏷️ Global Prefix
    app.setGlobalPrefix('api', {
      exclude: ['health', 'docs'],
    })
    
    // 📚 Swagger API Documentation
    if (nodeEnv === 'development') {
      const config = new DocumentBuilder()
        .setTitle('🔮 Tarot Mystique API')
        .setDescription('Ancient Wisdom Through Modern Technology - RESTful API for mystical tarot card readings')
        .setVersion('1.0')
        .addTag('cards', 'Tarot Cards Management')
        .addTag('readings', 'Card Reading Sessions')
        .addTag('interpretations', 'Card Interpretation Services')
        .addTag('users', 'User Management (Optional)')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .build()
      
      const document = SwaggerModule.createDocument(app, config)
      SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: '🔮 Tarot Mystique API Documentation',
        customfavIcon: '/favicon.ico',
        customCss: `
          .swagger-ui .topbar { background-color: #1a0b2e; }
          .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNkNGFmMzciLz4KPHN0YXIgY3g9IjIwIiBjeT0iMjAiIHI9IjEwIiBmaWxsPSIjMWEwYjJlIi8+Cjwvc3ZnPgo='); }
          .swagger-ui .info .title { color: #d4af37; }
        `,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          docExpansion: 'none',
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
        },
      })
      
      logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`)
    }
    
    // 🚀 Start the mystical server
    await app.listen(port)
    
    logger.log(`🌙 Tarot Mystique API is running on port ${port}`)
    logger.log(`🔮 Environment: ${nodeEnv}`)
    logger.log(`✨ The ancient wisdom awaits at http://localhost:${port}`)
    
    // 🎯 Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('🌅 Received SIGTERM, shutting down gracefully...')
      await app.close()
      process.exit(0)
    })
    
    process.on('SIGINT', async () => {
      logger.log('🌅 Received SIGINT, shutting down gracefully...')
      await app.close()
      process.exit(0)
    })
    
  } catch (error) {
    logger.error('💀 Failed to start the mystical server:', error)
    process.exit(1)
  }
}

// 🌟 Invoke the ancient startup ritual
bootstrap()
