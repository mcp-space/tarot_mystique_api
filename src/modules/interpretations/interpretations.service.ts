import { Injectable, Logger } from '@nestjs/common'
import { Card, SpreadType } from '@prisma/client'

@Injectable()
export class InterpretationsService {
  private readonly logger = new Logger(InterpretationsService.name)

  // 🔮 Generate interpretation for a single card
  async generateInterpretation(
    card: Card,
    reversed: boolean,
    spreadType: SpreadType,
    position: number,
    question?: string
  ): Promise<string> {
    this.logger.log(`✨ Interpreting ${card.name} (${reversed ? 'reversed' : 'upright'}) at position ${position}`)
    
    try {
      // Get base meaning from card data
      const meanings = reversed ? card.reversed : card.upright
      const baseMeaning = (meanings as any).general || '카드의 에너지가 당신에게 메시지를 전합니다.'
      
      // Add position context
      const positionContext = this.getPositionContext(spreadType, position)
      
      // Add question relevance if provided
      const questionContext = question ? this.getQuestionContext(card, question, reversed) : ''
      
      // Combine for full interpretation
      let interpretation = baseMeaning
      
      if (positionContext) {
        interpretation = `[${positionContext}] ${interpretation}`
      }
      
      if (questionContext) {
        interpretation += ` ${questionContext}`
      }
      
      // Add mystical enhancement
      interpretation += this.addMysticalEnhancement(card, reversed)
      
      return interpretation
      
    } catch (error) {
      this.logger.error(`💀 Failed to interpret card ${card.name}: ${error.message}`)
      return `${card.nameKr}의 신비로운 에너지가 당신의 질문에 답하고자 합니다. 직감을 믿고 카드의 상징을 깊이 묵상해보세요.`
    }
  }

  // 🌟 Generate overall reading interpretation
  async generateOverallReading(
    drawnCards: any[],
    spreadType: SpreadType,
    question?: string
  ): Promise<{ overallMessage: string; advice: string }> {
    this.logger.log(`🌙 Generating overall interpretation for ${spreadType} spread`)
    
    try {
      const cardNames = drawnCards.map(dc => dc.card.nameKr).join(', ')
      const reversedCount = drawnCards.filter(dc => dc.reversed).length
      
      let overallMessage: string
      let advice: string
      
      switch (spreadType) {
        case 'SINGLE':
          overallMessage = this.generateSingleCardMessage(drawnCards[0], question)
          advice = this.generateSingleCardAdvice(drawnCards[0])
          break
          
        case 'THREE_CARD':
          overallMessage = this.generateThreeCardMessage(drawnCards, question)
          advice = this.generateThreeCardAdvice(drawnCards)
          break
          
        case 'CELTIC_CROSS':
          overallMessage = this.generateCelticCrossMessage(drawnCards, question)
          advice = this.generateCelticCrossAdvice(drawnCards)
          break
          
        default:
          overallMessage = `뽑힌 카드들(${cardNames})이 우주의 메시지를 전달하고 있습니다.`
          advice = '직감을 믿고 카드들이 주는 지혜를 마음에 새기세요.'
      }
      
      // Add cosmic wisdom
      overallMessage += ` ${this.getCosmicWisdom()}`
      advice += ` ${this.getMysticalAdvice()}`
      
      return { overallMessage, advice }
      
    } catch (error) {
      this.logger.error(`💀 Failed to generate overall reading: ${error.message}`)
      return {
        overallMessage: '우주의 신비로운 에너지가 당신을 둘러싸고 있습니다. 카드들이 전하는 메시지를 마음으로 느껴보세요.',
        advice: '직감을 믿고 내면의 목소리에 귀 기울이세요. 답은 이미 당신 안에 있습니다.'
      }
    }
  }

  // 🎯 Private helper methods
  private getPositionContext(spreadType: SpreadType, position: number): string {
    const contexts: Record<SpreadType, string[]> = {
      SINGLE: ['오늘의 메시지'],
      THREE_CARD: ['과거의 영향', '현재 상황', '미래의 가능성'],
      CELTIC_CROSS: [
        '현재 상황', '가능한 결과', '과거의 영향', '잠재의식',
        '가능한 미래', '당신의 접근법', '외부 영향', '희망과 두려움',
        '최종 결과', '조언'
      ],
    }
    
    return contexts[spreadType]?.[position] || ''
  }

  private getQuestionContext(card: Card, question: string, reversed: boolean): string {
    // Simple keyword matching for question relevance
    const questionLower = question.toLowerCase()
    
    if (questionLower.includes('사랑') || questionLower.includes('연애') || questionLower.includes('관계')) {
      const loveMeaning = reversed ? (card.reversed as any).love : (card.upright as any).love
      return loveMeaning ? `연애/관계 측면에서 ${loveMeaning}` : ''
    }
    
    if (questionLower.includes('직업') || questionLower.includes('일') || questionLower.includes('사업') || questionLower.includes('커리어')) {
      const careerMeaning = reversed ? (card.reversed as any).career : (card.upright as any).career
      return careerMeaning ? `직업/사업 측면에서 ${careerMeaning}` : ''
    }
    
    if (questionLower.includes('건강') || questionLower.includes('몸')) {
      const healthMeaning = reversed ? (card.reversed as any).health : (card.upright as any).health
      return healthMeaning ? `건강 측면에서 ${healthMeaning}` : ''
    }
    
    return ''
  }

  private addMysticalEnhancement(card: Card, reversed: boolean): string {
    const enhancements = [
      ` ${card.nameKr}의 신비로운 에너지가 당신을 인도합니다.`,
      ` 우주의 리듬에 맞춰 ${card.nameKr}의 지혜를 받아들이세요.`,
      ` ${card.nameKr}이 전하는 고대의 지혜에 마음을 열어보세요.`,
      ` 별들의 속삭임이 ${card.nameKr}을 통해 당신에게 닿습니다.`,
    ]
    
    if (reversed) {
      return ' 역방향 에너지는 내면의 성찰과 변화의 필요성을 나타냅니다.'
    }
    
    return enhancements[Math.floor(Math.random() * enhancements.length)]
  }

  private generateSingleCardMessage(drawnCard: any, question?: string): string {
    const card = drawnCard.card
    const reversed = drawnCard.reversed
    
    let message = `${card.nameKr}이 오늘 당신에게 전하는 메시지입니다.`
    
    if (question) {
      message += ` "${question}"에 대한 답으로서,`
    }
    
    message += ` 이 카드는 ${reversed ? '내면의 성찰' : '외향적 행동'}을 통한 성장을 제시합니다.`
    
    return message
  }

  private generateSingleCardAdvice(drawnCard: any): string {
    const card = drawnCard.card
    const keywords = card.keywordsKr || []
    
    if (keywords.length > 0) {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)]
      return `${keyword}의 에너지를 마음에 품고 하루를 시작하세요.`
    }
    
    return `${card.nameKr}의 지혜를 따라 직감을 믿고 행동하세요.`
  }

  private generateThreeCardMessage(drawnCards: any[], question?: string): string {
    const [past, present, future] = drawnCards
    
    return `과거(${past.card.nameKr}), 현재(${present.card.nameKr}), 미래(${future.card.nameKr})의 연결고리가 당신의 운명을 이루고 있습니다. 과거의 경험이 현재의 선택에 영향을 주고, 이는 밝은 미래로 이어질 것입니다.`
  }

  private generateThreeCardAdvice(drawnCards: any[]): string {
    const reversedCount = drawnCards.filter(dc => dc.reversed).length
    
    if (reversedCount === 0) {
      return '모든 카드가 정방향으로 나타났습니다. 우주의 에너지가 당신을 강력히 지지하고 있으니 자신감을 가지고 나아가세요.'
    } else if (reversedCount === 3) {
      return '모든 카드가 역방향입니다. 내면의 성찰과 기다림이 필요한 시기입니다. 서두르지 말고 때를 기다리세요.'
    } else {
      return '정방향과 역방향 카드가 균형을 이루고 있습니다. 외적 행동과 내적 성찰의 조화를 통해 균형잡힌 해답을 찾으세요.'
    }
  }

  private generateCelticCrossMessage(drawnCards: any[], question?: string): string {
    const centerCard = drawnCards[0] // Present situation
    const outcomeCard = drawnCards[8] // Final outcome
    
    return `현재 상황을 나타내는 ${centerCard.card.nameKr}와 최종 결과인 ${outcomeCard.card.nameKr}이 보여주는 당신의 운명의 길입니다. 열 장의 카드가 그려내는 복잡한 상황 속에서도 우주는 명확한 방향을 제시하고 있습니다.`
  }

  private generateCelticCrossAdvice(drawnCards: any[]): string {
    const adviceCard = drawnCards[9] // Advice position
    
    return `조언의 위치에 있는 ${adviceCard.card.nameKr}이 말합니다: 복잡해 보이는 상황도 한 걸음씩 차근차근 풀어나가면 됩니다. 카드들이 보여주는 각각의 측면을 이해하고 전체적인 그림을 그려보세요.`
  }

  private getCosmicWisdom(): string {
    const wisdoms = [
      '별들이 당신의 길을 비춰줄 것입니다.',
      '우주의 리듬에 맞춰 흘러가세요.',
      '달빛 아래서 진정한 답을 찾게 될 것입니다.',
      '고대의 지혜가 현재의 당신을 인도합니다.',
      '신비로운 에너지가 당신을 둘러싸고 있습니다.'
    ]
    
    return wisdoms[Math.floor(Math.random() * wisdoms.length)]
  }

  private getMysticalAdvice(): string {
    const advices = [
      '직감을 믿고 내면의 목소리에 귀 기울이세요.',
      '명상과 성찰을 통해 더 깊은 통찰을 얻으세요.',
      '우주의 흐름에 자신을 맡기고 받아들이세요.',
      '카드의 상징들을 마음에 새기고 일상에서 실천하세요.',
      '신비로운 동조화의 힘을 믿고 행동하세요.'
    ]
    
    return advices[Math.floor(Math.random() * advices.length)]
  }
}
