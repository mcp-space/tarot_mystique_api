import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔮 Major Arcana Cards Data - The Sacred 22
const majorArcanaCards = [
  {
    arcanaId: 0,
    name: 'The Fool',
    nameKr: '광대',
    imageUrl: '/images/tarot/00-fool.jpg',
    keywords: ['new beginnings', 'innocence', 'spontaneity', 'free spirit'],
    keywordsKr: ['새로운 시작', '순수함', '자발성', '자유로운 영혼'],
    upright: {
      general: '새로운 여행의 시작, 순수한 마음으로 모험을 떠날 때입니다. 두려움 없이 앞으로 나아가세요.',
      love: '새로운 만남이나 관계의 시작을 의미합니다. 열린 마음으로 사랑을 받아들이세요.',
      career: '새로운 직업이나 프로젝트의 시작. 창의적이고 혁신적인 접근이 필요합니다.',
      health: '새로운 건강 관리 방법을 시도해보세요. 활력과 에너지가 넘치는 시기입니다.'
    },
    reversed: {
      general: '무모함과 경솔함을 조심하세요. 신중한 계획이 필요한 때입니다.',
      love: '성급한 결정을 피하고, 관계에서 더 신중하게 행동하세요.',
      career: '준비 부족으로 인한 실패 가능성. 더 많은 계획과 준비가 필요합니다.',
      health: '건강을 소홀히 하지 마세요. 무리한 활동은 피하는 것이 좋습니다.'
    },
    description: 'The Fool represents new beginnings, having faith in the future, being inexperienced, not knowing what to expect, having beginner\'s luck, improvisation and believing in the universe.',
    descriptionKr: '광대는 새로운 시작, 미래에 대한 믿음, 경험 부족, 예상치 못한 상황, 초보자의 행운, 즉흥성, 그리고 우주에 대한 믿음을 나타냅니다.',
    element: 'Air',
    planet: 'Uranus',
    numerology: 0,
    symbolism: ['white rose (purity)', 'cliff (leap of faith)', 'small bag (memories)', 'mountains (challenges ahead)']
  },
  {
    arcanaId: 1,
    name: 'The Magician',
    nameKr: '마법사',
    imageUrl: '/images/tarot/01-magician.jpg',
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'],
    keywordsKr: ['현실화', '수완', '힘', '영감받은 행동'],
    upright: {
      general: '당신은 목표를 달성할 모든 도구와 능력을 가지고 있습니다. 의지력으로 현실을 창조하세요.',
      love: '적극적인 행동으로 원하는 관계를 만들어갈 수 있습니다. 진정성 있는 의사소통이 중요합니다.',
      career: '리더십과 창의성을 발휘할 때입니다. 새로운 프로젝트나 사업에 적극 나서세요.',
      health: '자기 치유력이 강한 시기입니다. 의지력으로 건강을 회복할 수 있습니다.'
    },
    reversed: {
      general: '능력을 잘못 사용하거나 조작적인 행동을 조심하세요. 진정성이 필요합니다.',
      love: '관계에서 조작이나 속임수를 사용하지 마세요. 솔직함이 최선입니다.',
      career: '능력 부족이나 자신감 결여로 인한 어려움. 더 많은 준비와 연습이 필요합니다.',
      health: '건강 관리에 더 많은 관심과 노력이 필요합니다. 전문가의 도움을 받으세요.'
    },
    description: 'The Magician represents taking action, having the power to manifest your desires, being resourceful, and having the ability to make things happen.',
    descriptionKr: '마법사는 행동을 취하는 것, 욕망을 현실화할 힘을 가진 것, 수완이 뛰어난 것, 그리고 일을 성사시킬 능력을 나타냅니다.',
    element: 'Air',
    planet: 'Mercury',
    numerology: 1,
    symbolism: ['infinity symbol (unlimited potential)', 'four suit symbols (mastery of elements)', 'white robe (purity)', 'red cloak (worldly experience)']
  },
  {
    arcanaId: 2,
    name: 'The High Priestess',
    nameKr: '여교황',
    imageUrl: '/images/tarot/02-high-priestess.jpg',
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious mind'],
    keywordsKr: ['직감', '신성한 지식', '신성한 여성성', '잠재의식'],
    upright: {
      general: '내면의 목소리에 귀 기울이세요. 직감과 영감이 당신을 올바른 길로 인도할 것입니다.',
      love: '감정의 깊이를 탐구하고, 상대방의 진심을 느껴보세요. 비언어적 소통이 중요합니다.',
      career: '창의성과 직관을 활용한 업무가 성공할 것입니다. 급하게 결정하지 말고 때를 기다리세요.',
      health: '몸의 신호에 주의를 기울이세요. 스트레스 관리와 정신적 균형이 중요합니다.'
    },
    reversed: {
      general: '내면의 목소리를 무시하고 있지는 않나요? 직감을 회복하고 내적 지혜에 귀 기울이세요.',
      love: '감정을 억압하거나 진실을 외면하고 있습니다. 솔직한 대화가 필요합니다.',
      career: '정보 부족이나 소통 문제로 인한 어려움. 더 많은 조사와 연구가 필요합니다.',
      health: '몸의 신호를 놓치고 있을 수 있습니다. 정기 검진과 예방 관리가 중요합니다.'
    },
    description: 'The High Priestess represents intuition, higher powers, mystery, and the subconscious mind. She sits between the conscious and unconscious realms.',
    descriptionKr: '여교황은 직관, 고차원적 힘, 신비, 그리고 잠재의식을 나타냅니다. 그녀는 의식과 무의식 영역 사이에 앉아 있습니다.',
    element: 'Water',
    planet: 'Moon',
    numerology: 2,
    symbolism: ['pomegranates (feminine fertility)', 'moon at feet (intuition)', 'cross (balance)', 'blue robe (knowledge)']
  }
  // ... 나머지 19개 카드는 실제 구현 시 추가
]

async function main() {
  console.log('🔮 Starting to seed the mystical database...')
  
  try {
    // Clear existing data
    await prisma.drawnCard.deleteMany()
    await prisma.reading.deleteMany()
    await prisma.card.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✨ Cleared existing data')
    
    // Create Major Arcana cards
    for (const cardData of majorArcanaCards) {
      await prisma.card.create({
        data: {
          ...cardData,
          arcanaType: 'MAJOR'
        }
      })
    }
    
    console.log(`🌟 Created ${majorArcanaCards.length} Major Arcana cards`)
    
    // Create sample readings for demonstration
    const sampleUser = await prisma.user.create({
      data: {
        displayName: '신비로운 구도자',
        preferredLanguage: 'ko',
        timezone: 'Asia/Seoul',
        isPublic: false
      }
    })
    
    const sampleReading = await prisma.reading.create({
      data: {
        spreadType: 'SINGLE',
        question: '오늘 나에게 필요한 메시지는 무엇인가요?',
        userId: sampleUser.id,
        overallMessage: '새로운 시작을 위한 용기를 가지세요.',
        advice: '직감을 믿고 앞으로 나아가세요.'
      }
    })
    
    await prisma.drawnCard.create({
      data: {
        cardId: 1, // The Fool
        readingId: sampleReading.id,
        position: 0,
        positionName: '오늘의 메시지',
        reversed: false,
        interpretation: '새로운 여행의 시작을 알리는 카드입니다. 순수한 마음으로 모험을 떠날 때입니다.',
        confidence: 0.95
      }
    })
    
    console.log('🎯 Created sample reading data')
    
    // Initialize reading stats
    await prisma.readingStats.create({
      data: {
        date: new Date(),
        totalReadings: 1,
        singleCard: 1,
        threeCard: 0,
        celticCross: 0,
        mostDrawnCardId: 1
      }
    })
    
    console.log('📊 Initialized reading statistics')
    
    console.log('🌙 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('💀 Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('💀 Fatal error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
