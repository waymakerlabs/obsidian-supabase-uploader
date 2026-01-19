# Obsidian Supabase Image Uploader

An Obsidian plugin that automatically uploads images to your Supabase Storage when you paste or drag & drop them into your notes.

## Features

- **Paste Upload**: Paste images from clipboard (Ctrl/Cmd+V) and they're automatically uploaded
- **Drag & Drop**: Drag image files into the editor for instant upload
- **Auto Markdown**: Uploaded images are automatically converted to `![](url)` markdown format
- **Delete from Context Menu**: Right-click on an image link to delete it from Supabase Storage
- **Date-based Organization**: Images are stored in `YYYY/MM/DD/uuid.ext` folder structure
- **Easy Configuration**: Just configure your Supabase URL, API key, and bucket name
- **Flexible Backend**: Works with both Supabase Cloud and self-hosted Supabase instances

## Installation

### From Community Plugins (Recommended)

1. Open Obsidian Settings → Community plugins
2. Disable Restricted mode if prompted
3. Click "Browse" and search for "Supabase Image Uploader"
4. Click Install, then Enable

### Manual Installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/waymakerlabs/obsidian-supabase-uploader/releases)
2. Create folder: `{your-vault}/.obsidian/plugins/supabase-image-uploader/`
3. Copy the downloaded files into this folder
4. Restart Obsidian and enable the plugin in Settings → Community plugins

## Configuration

### 1. Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing one)
3. Navigate to **Storage** and create a new bucket (e.g., `obsidian-images`)
4. Set the bucket to **Public**
5. Add storage policies in **SQL Editor**:

```sql
-- Allow anonymous uploads
CREATE POLICY "Allow anonymous uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'obsidian-images');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'obsidian-images');

-- (Optional) Allow anonymous delete
CREATE POLICY "Allow anonymous delete"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'obsidian-images');
```

### 2. Plugin Settings

1. Go to Obsidian Settings → Community plugins → Supabase Image Uploader → ⚙️
2. Enter your settings:
   - **Supabase URL**: Your project URL (e.g., `https://xxxxx.supabase.co`)
   - **Supabase Anon Key**: Your project's anon/public key
   - **Bucket Name**: The bucket you created (default: `obsidian-images`)
3. Click **Test** to verify the connection

## Usage

Once configured:

1. **Paste**: Copy an image to clipboard and press Ctrl/Cmd+V in your note
2. **Drag & Drop**: Drag an image file from your file explorer into the editor

During upload, you'll see a placeholder: `![Uploading image.png...]()`

After upload completes, it will be replaced with: `![](https://your-project.supabase.co/storage/v1/object/public/...)`

### Deleting Images

1. Place your cursor on an image markdown link
2. Right-click to open the context menu
3. Select "Delete from Supabase"
4. Confirm deletion in the dialog

## Supported Image Types

| Format | MIME Type | Max Size |
|--------|-----------|----------|
| PNG | image/png | 10MB |
| JPEG | image/jpeg | 10MB |
| GIF | image/gif | 10MB |
| WebP | image/webp | 10MB |

## Architecture

This plugin follows Clean Architecture principles:

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

## Development

```bash
# Install dependencies
npm install

# Run tests (30 tests, 97% coverage)
npm test

# Development build with watch mode
npm run dev

# Production build
npm run build
```

## Troubleshooting

### "Bucket not found" error
- Verify the bucket exists in Supabase Dashboard → Storage
- Check that the bucket name in settings matches exactly

### "Connection failed" error
- Verify your Supabase URL (no trailing slash)
- Ensure you're using the **anon** key, not the service_role key
- Check that your Supabase project is active

### Upload fails
- Check file size (max 10MB)
- Verify the image format is supported (PNG, JPEG, GIF, WebP)
- Ensure INSERT policy is configured for the bucket

### Delete fails
- Ensure DELETE policy is configured in Supabase

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT](LICENSE)
