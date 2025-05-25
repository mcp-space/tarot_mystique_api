import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'

// 🔮 Core Modules
import { PrismaModule } from './modules/prisma/prisma.module'
import { CardsModule } from './modules/cards/cards.module'
import { ReadingsModule } from './modules/readings/readings.module'
import { UsersModule } from './modules/users/users.module'
import { InterpretationsModule } from './modules/interpretations/interpretations.module'

// 🎯 Configuration
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    // 🔧 Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),
    
    // 🛡️ Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get<number>('THROTTLE_TTL', 60),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        }],
      }),
    }),
    
    // 🚀 Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
      max: 1000, // Maximum number of items in cache
    }),
    
    // 📝 Logging
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get<string>('NODE_ENV') === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.colorize({ all: true }),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            return `🔮 ${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`
          }),
        ),
        transports: [
          new winston.transports.Console(),
          ...(configService.get<string>('NODE_ENV') === 'production'
            ? [
                new winston.transports.File({
                  filename: 'logs/error.log',
                  level: 'error',
                }),
                new winston.transports.File({
                  filename: 'logs/combined.log',
                }),
              ]
            : []),
        ],
      }),
    }),
    
    // 🔮 Core Business Modules
    PrismaModule,
    CardsModule,
    ReadingsModule,
    UsersModule,
    InterpretationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
