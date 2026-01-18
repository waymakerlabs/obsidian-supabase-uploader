# Obsidian Supabase Image Uploader - 개발 계획

## 📋 프로젝트 개요

Obsidian에서 이미지를 붙여넣기/드래그앤드롭하면 Supabase Storage에 자동 업로드하고, 마크다운 링크로 변환하는 플러그인

## 🎯 핵심 요구사항

1. 이미지 붙여넣기(Ctrl+V) 시 Supabase Storage에 자동 업로드
2. 드래그 앤 드롭 지원
3. 업로드 후 마크다운 이미지 링크로 자동 변환
4. 설정 화면에서 Supabase URL, Anon Key, 버킷 이름 설정 가능

## 🏗️ 클린 아키텍처 설계

### 레이어 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Obsidian Plugin, Settings UI, Event Handlers)             │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  (Use Cases: UploadImageUseCase)                            │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (Entities: ImageFile, UploadResult)                        │
│  (Interfaces: IStorageService, IPathGenerator)              │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                        │
│  (SupabaseStorageService, DateBasedPathGenerator)           │
└─────────────────────────────────────────────────────────────┘
```

### 의존성 규칙
- 의존성은 항상 외부에서 내부로 향함
- Domain 레이어는 어떤 외부 라이브러리에도 의존하지 않음
- Obsidian API, Supabase SDK는 Infrastructure/Presentation에서만 사용

## 📁 프로젝트 구조

```
obsidian-supabase-uploader/
├── src/
│   ├── domain/                      # 핵심 비즈니스 로직
│   │   ├── entities/
│   │   │   ├── ImageFile.ts         # 이미지 파일 엔티티
│   │   │   └── UploadResult.ts      # 업로드 결과 엔티티
│   │   └── interfaces/
│   │       ├── IStorageService.ts   # 스토리지 서비스 인터페이스
│   │       └── IPathGenerator.ts    # 경로 생성 인터페이스
│   │
│   ├── application/                 # 애플리케이션 유스케이스
│   │   └── usecases/
│   │       └── UploadImageUseCase.ts
│   │
│   ├── infrastructure/              # 외부 서비스 구현체
│   │   ├── storage/
│   │   │   └── SupabaseStorageService.ts
│   │   └── path/
│   │       └── DateBasedPathGenerator.ts
│   │
│   └── presentation/                # Obsidian 플러그인 UI/이벤트
│       ├── plugin/
│       │   └── SupabaseUploaderPlugin.ts
│       ├── settings/
│       │   └── SettingsTab.ts
│       └── handlers/
│           ├── PasteHandler.ts
│           └── DropHandler.ts
│
├── tests/                           # 테스트 파일
│   ├── domain/
│   │   └── entities/
│   │       └── ImageFile.test.ts
│   ├── application/
│   │   └── usecases/
│   │       └── UploadImageUseCase.test.ts
│   ├── infrastructure/
│   │   └── path/
│   │       └── DateBasedPathGenerator.test.ts
│   └── mocks/
│       ├── MockStorageService.ts
│       └── MockPathGenerator.ts
│
├── main.ts                          # 플러그인 진입점
├── manifest.json
├── package.json
├── tsconfig.json
├── jest.config.js
├── esbuild.config.mjs
└── README.md
```

## 🧪 TDD 개발 순서

### Phase 1: Domain Layer (테스트 우선)

| 순서 | 테스트 | 구현 | 상태 |
|------|--------|------|------|
| 1-1 | `ImageFile.test.ts` - 이미지 파일 유효성 검증 | `ImageFile.ts` | ✅ |
| 1-2 | `UploadResult.test.ts` - 업로드 결과 생성 | `UploadResult.ts` | ✅ |

### Phase 2: Infrastructure Layer

| 순서 | 테스트 | 구현 | 상태 |
|------|--------|------|------|
| 2-1 | `DateBasedPathGenerator.test.ts` - 날짜 기반 경로 생성 | `DateBasedPathGenerator.ts` | ✅ |
| 2-2 | `SupabaseStorageService.ts` - 스토리지 업로드 | `SupabaseStorageService.ts` | ✅ |

### Phase 3: Application Layer

| 순서 | 테스트 | 구현 | 상태 |
|------|--------|------|------|
| 3-1 | `UploadImageUseCase.test.ts` - 이미지 업로드 유스케이스 | `UploadImageUseCase.ts` | ✅ |

### Phase 4: Presentation Layer

| 순서 | 구현 | 상태 |
|------|------|------|
| 4-1 | `SupabaseUploaderPlugin.ts` - 메인 플러그인 | ✅ |
| 4-2 | `SettingsTab.ts` - 설정 UI | ✅ |
| 4-3 | `PasteHandler.ts` - 붙여넣기 핸들러 | ✅ |
| 4-4 | `DropHandler.ts` - 드래그앤드롭 핸들러 | ✅ |

## 🔧 Supabase 설정 (사전 작업)

Supabase Dashboard에서 버킷 생성 필요:
- URL: https://supabase.waymakerlabs.kr
- 버킷명: `obsidian-images`
- 공개 설정: Public
- RLS 정책: anon key로 업로드 허용

## ✅ 진행 상황

- [x] 계획 수립
- [x] 프로젝트 초기화 & Git 초기화
- [x] 프로젝트 Scaffolding
- [x] Domain Layer TDD 구현 (16 tests passed)
- [x] Infrastructure Layer TDD 구현 (7 tests passed)
- [x] Application Layer TDD 구현 (7 tests passed)
- [x] Presentation Layer 구현
- [x] 빌드 & 테스트 (30 tests total, all passed)
- [ ] GitHub Repo 생성 & 푸시

## 📦 산출물

1. GitHub Repository: `waymakerlabs/obsidian-supabase-uploader`
2. 빌드된 플러그인: `main.js`, `manifest.json`
3. 테스트 커버리지 리포트
