import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { User } from '@prisma/client'

interface CreateUserDto {
  email?: string
  username?: string
  displayName?: string
  preferredLanguage?: string
  timezone?: string
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private readonly prisma: PrismaService) {}

  // 🧙‍♀️ Create a new mystical seeker
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`✨ Welcoming a new seeker to the mystical realm`)
    
    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          preferredLanguage: createUserDto.preferredLanguage || 'ko',
          timezone: createUserDto.timezone || 'Asia/Seoul',
        },
      })
      
      this.logger.log(`🌟 New user created: ${user.displayName || user.username || user.id}`)
      return user
      
    } catch (error) {
      this.logger.error(`💀 Failed to create user: ${error.message}`)
      throw error
    }
  }

  // 🔍 Find a user by ID
  async findOne(id: string): Promise<User> {
    this.logger.log(`🔍 Seeking user ${id} in the cosmic records`)
    
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        readings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            drawnCards: {
              take: 3,
              include: {
                card: {
                  select: {
                    name: true,
                    nameKr: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    
    if (!user) {
      throw new NotFoundException(`💀 User ${id} not found in the mystical realm`)
    }
    
    return user
  }

  // 📧 Find user by email
  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`📧 Searching for seeker by email`)
    
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  // 👤 Find user by username
  async findByUsername(username: string): Promise<User | null> {
    this.logger.log(`👤 Searching for seeker by username`)
    
    return this.prisma.user.findUnique({
      where: { username },
    })
  }

  // ✨ Update user profile
  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User> {
    this.logger.log(`✨ Updating profile for user ${id}`)
    
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })
      
      this.logger.log(`🌟 Profile updated successfully`)
      return user
      
    } catch (error) {
      this.logger.error(`💀 Failed to update user: ${error.message}`)
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`💀 User ${id} not found`)
      }
      
      throw error
    }
  }

  // 📊 Get user statistics
  async getUserStats(id: string) {
    this.logger.log(`📊 Calculating cosmic statistics for user ${id}`)
    
    const [user, totalReadings, recentActivity, favoriteSpread] = await Promise.all([
      this.prisma.user.findUnique({ where: { id } }),
      this.prisma.reading.count({ where: { userId: id } }),
      this.prisma.reading.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reading.groupBy({
        by: ['spreadType'],
        where: { userId: id },
        _count: { spreadType: true },
        orderBy: { _count: { spreadType: 'desc' } },
        take: 1,
      }),
    ])
    
    if (!user) {
      throw new NotFoundException(`💀 User ${id} not found`)
    }
    
    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        joinedAt: user.createdAt,
      },
      totalReadings,
      lastReading: recentActivity?.createdAt || null,
      favoriteSpread: favoriteSpread[0]?.spreadType || null,
      mysticLevel: this.calculateMysticLevel(totalReadings),
      cosmicInsight: this.getCosmicInsight(totalReadings),
    }
  }

  // 🌟 Private helper methods
  private calculateMysticLevel(readingCount: number): string {
    if (readingCount >= 100) return '🔮 Grand Mystic'
    if (readingCount >= 50) return '✨ Cosmic Sage'
    if (readingCount >= 20) return '🌙 Lunar Adept'
    if (readingCount >= 10) return '⭐ Star Seeker'
    if (readingCount >= 5) return '🌟 Mystic Apprentice'
    return '🔍 Curious Explorer'
  }

  private getCosmicInsight(readingCount: number): string {
    const insights = [
      '당신의 영혼은 우주의 리듬과 조화를 이루고 있습니다.',
      '별들이 당신의 여정을 축복하고 있습니다.',
      '고대의 지혜가 당신을 통해 흘러가고 있습니다.',
      '신비로운 에너지가 당신의 직감을 날카롭게 만들고 있습니다.',
      '우주의 메시지를 받아들이는 당신의 능력이 성장하고 있습니다.',
    ]
    
    return insights[readingCount % insights.length]
  }
}
