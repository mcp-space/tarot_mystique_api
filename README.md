# 🌙 Tarot Mystique API

**Ancient Wisdom Through Modern Technology**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## ✨ 프로젝트 소개

타로 미스틱 API는 신비로운 타로카드 지혜를 제공하는 RESTful API 서버입니다. 메이저 아르카나 카드 데이터, 카드 리딩 기능, 그리고 사용자 리딩 이력 관리를 제공합니다.

### 🔮 주요 기능

- **메이저 아르카나 API** - 22장의 완전한 메이저 아르카나 카드 데이터
- **카드 리딩 서비스** - 다양한 스프레드 타입 지원 (원카드, 쓰리카드, 켈틱크로스)
- **리딩 해석 AI** - 상황별 맞춤 카드 해석 제공
- **리딩 이력 관리** - 사용자별 리딩 기록 저장 및 조회
- **이미지 관리** - 타로카드 이미지 업로드 및 서빙
- **실시간 알림** - WebSocket을 통한 실시간 카드 드로우 경험

## 🎨 아키텍처 철학

> *"코드도 마법처럼 아름다워야 한다"*

- **도메인 주도 설계** - 타로의 신비로운 도메인을 코드로 완벽 표현
- **헥사고널 아키텍처** - 깔끔한 의존성 분리로 마법 같은 확장성
- **이벤트 소싱** - 모든 리딩을 우주의 기록으로 보존
- **CQRS 패턴** - 읽기와 쓰기의 완벽한 분리

## 🔥 기술 스택

### Core
- **NestJS** - 엔터프라이즈급 Node.js 프레임워크
- **TypeScript** - 타입 안전성으로 버그를 미연에 방지
- **Prisma ORM** - 타입 안전한 데이터베이스 액세스
- **PostgreSQL** - 강력한 관계형 데이터베이스

### Authentication & Security
- **JWT** - JSON Web Token 기반 인증
- **Passport** - 다양한 인증 전략 지원
- **Helmet** - 보안 헤더 설정
- **Rate Limiting** - API 요청 제한

### Real-time & Caching
- **WebSocket** - 실시간 카드 드로우 경험
- **Redis** - 고성능 캐싱 및 세션 관리
- **Bull Queue** - 비동기 작업 처리

### DevOps & Monitoring
- **Docker** - 컨테이너화된 배포
- **Swagger** - API 문서 자동 생성
- **Winston** - 구조화된 로깅
- **Prometheus** - 메트릭 수집

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker (선택사항)

### 환경 설정

```bash
# 저장소 클론
git clone https://github.com/mcp-space/tarot_mystique_api.git
cd tarot_mystique_api

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 및 기타 설정 입력

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 시드 데이터 생성 (메이저 아르카나 카드)
npx prisma db seed

# 개발 서버 시작
npm run start:dev
```

### Docker로 실행

```bash
# Docker Compose로 전체 스택 실행 (PostgreSQL, Redis 포함)
docker-compose up -d

# 애플리케이션만 실행
docker run -p 3000:3000 tarot-mystique-api
```

## 📡 API 엔드포인트

### 타로카드 관리
```
GET    /api/cards              # 모든 메이저 아르카나 카드 조회
GET    /api/cards/:id          # 특정 카드 상세 조회
GET    /api/cards/random       # 랜덤 카드 뽑기
POST   /api/cards/random/:count # 여러 카드 뽑기
```

### 리딩 서비스
```
POST   /api/readings           # 새로운 리딩 생성
GET    /api/readings/:id       # 리딩 결과 조회
GET    /api/readings/user/:userId # 사용자 리딩 이력
POST   /api/readings/interpret  # 카드 해석 요청
```

### 실시간 기능
```
WS     /socket/readings        # 실시간 카드 드로우
```

## 📁 프로젝트 구조

```
src/
├── modules/                # 기능별 모듈
│   ├── cards/             # 타로카드 모듈
│   ├── readings/          # 리딩 모듈
│   ├── users/             # 사용자 모듈
│   └── interpretations/   # 해석 모듈
├── common/                # 공통 기능
│   ├── decorators/        # 커스텀 데코레이터
│   ├── filters/           # 예외 필터
│   ├── guards/            # 가드
│   ├── interceptors/      # 인터셉터
│   └── pipes/             # 파이프
├── config/                # 설정 파일
├── database/              # 데이터베이스 관련
│   ├── migrations/        # 마이그레이션
│   └── seeds/             # 시드 데이터
└── shared/                # 공유 타입 및 유틸
```

## 🎯 개발 스크립트

```bash
# 개발 서버 (hot reload)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start:prod

# 테스트 실행
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov

# 린팅
npm run lint

# 데이터베이스 관리
npx prisma studio     # DB 관리 UI
npx prisma generate   # 클라이언트 생성
npx prisma migrate dev # 마이그레이션 실행
```

## 🔮 데이터베이스 스키마

### 주요 엔티티

- **Card** - 타로카드 정보 (이름, 이미지, 의미, 상징)
- **Reading** - 카드 리딩 세션
- **DrawnCard** - 뽑힌 카드와 위치 정보
- **User** - 사용자 정보 (선택사항)
- **Interpretation** - 카드 해석 결과

## 🌟 커밋 컨벤션

- `🔮 feat:` 새로운 마법적 기능 추가
- `⚡ perf:` 성능 향상
- `🐛 fix:` 버그 수정
- `📚 docs:` 문서 업데이트
- `🎨 style:` 코드 포맷팅
- `♻️ refactor:` 리팩토링
- `✅ test:` 테스트 추가/수정
- `🔧 chore:` 기타 작업

## 🔗 관련 링크

- [Frontend Repository](https://github.com/mcp-space/tarot_mystique_web)
- [API Documentation](http://localhost:3000/api/docs) *(개발 서버 실행 후)*
- [Live API](https://api.tarot-mystique.com) *(배포 후 업데이트)*

## 📜 라이선스

MIT License - 자유롭게 사용하고 마법을 부려보세요.

---

*"진정한 마법은 코드 안에 있다..."* 🌙

**Crafted with 🔮 by mcp-space**
