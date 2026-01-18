# Obsidian Supabase Image Uploader

Obsidian에서 이미지를 붙여넣기/드래그앤드롭하면 Supabase Storage에 자동 업로드하고, 마크다운 링크로 변환하는 플러그인입니다.

## ✨ Features

- 📋 **붙여넣기 지원**: Ctrl/Cmd+V로 클립보드의 이미지를 바로 업로드
- 🖱️ **드래그 앤 드롭**: 이미지 파일을 에디터에 드롭하면 자동 업로드
- 🔗 **마크다운 링크 자동 변환**: 업로드된 이미지는 `![](url)` 형식으로 삽입
- ⚙️ **간편한 설정**: Supabase URL, API Key, 버킷 이름만 설정하면 OK
- 📁 **날짜 기반 경로**: `YYYY/MM/DD/uuid.ext` 형식으로 자동 정리

## 🚀 Installation

### Manual Installation

1. 최신 릴리즈에서 `main.js`, `manifest.json` 다운로드
2. Obsidian vault의 `.obsidian/plugins/supabase-image-uploader/` 폴더 생성
3. 다운로드한 파일을 해당 폴더에 복사
4. Obsidian 설정 → Community plugins → Supabase Image Uploader 활성화

## ⚙️ Configuration

### Supabase 설정

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. Storage → Create bucket으로 새 버킷 생성 (예: `obsidian-images`)
3. 버킷 설정에서 **Public** 으로 변경
4. Policies에서 INSERT 정책 추가:
   ```sql
   CREATE POLICY "Allow anonymous uploads"
   ON storage.objects FOR INSERT
   TO anon
   WITH CHECK (bucket_id = 'obsidian-images');
   ```

### 플러그인 설정

1. Obsidian 설정 → Community plugins → Supabase Image Uploader → ⚙️
2. 다음 항목 입력:
   - **Supabase URL**: `https://your-project.supabase.co`
   - **Supabase Anon Key**: 프로젝트의 anon/public key
   - **Bucket Name**: 생성한 버킷 이름 (기본값: `obsidian-images`)
3. **Test** 버튼으로 연결 확인

## 📖 Usage

설정 완료 후:

1. **붙여넣기**: 이미지를 클립보드에 복사한 후 노트에서 Ctrl/Cmd+V
2. **드래그 앤 드롭**: 이미지 파일을 노트 에디터에 드래그

업로드 중에는 `![Uploading image.png...]()` 플레이스홀더가 표시되고,
완료 후 `![](https://...)`로 자동 변환됩니다.

## 🏗️ Architecture

이 플러그인은 Clean Architecture 원칙을 따릅니다:

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (Plugin, Settings, Event Handlers)     │
├─────────────────────────────────────────┤
│          Application Layer              │
│  (UploadImageUseCase)                   │
├─────────────────────────────────────────┤
│            Domain Layer                 │
│  (ImageFile, UploadResult, Interfaces)  │
├─────────────────────────────────────────┤
│        Infrastructure Layer             │
│  (SupabaseStorageService, PathGenerator)│
└─────────────────────────────────────────┘
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for development (watch mode)
npm run dev

# Build for production
npm run build
```

## 📝 Supported Image Types

- PNG (`image/png`)
- JPEG (`image/jpeg`)
- GIF (`image/gif`)
- WebP (`image/webp`)

최대 파일 크기: **10MB**

## 📄 License

MIT License

## 🙏 Contributing

Issues와 Pull Requests를 환영합니다!
