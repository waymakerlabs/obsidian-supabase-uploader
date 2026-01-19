import { Plugin, MarkdownView, Editor, Menu, Notice, Modal, App } from 'obsidian';
import { SettingsTab, PluginSettings, DEFAULT_SETTINGS } from '../settings/SettingsTab';
import { PasteHandler } from '../handlers/PasteHandler';
import { DropHandler } from '../handlers/DropHandler';
import { UploadImageUseCase } from '../../application/usecases/UploadImageUseCase';
import { SupabaseStorageService } from '../../infrastructure/storage/SupabaseStorageService';
import { DateBasedPathGenerator } from '../../infrastructure/path/DateBasedPathGenerator';

/**
 * Confirmation modal for delete action
 */
class DeleteConfirmModal extends Modal {
  private onConfirm: () => void;
  private imagePath: string;

  constructor(app: App, imagePath: string, onConfirm: () => void) {
    super(app);
    this.imagePath = imagePath;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Delete image from Supabase?' });
    contentEl.createEl('p', { text: 'This will permanently delete the image from Supabase storage' });
    contentEl.createEl('p', { text: this.imagePath, cls: 'delete-confirm-path' });
    contentEl.createEl('p', { text: 'This action cannot be undone.', cls: 'delete-confirm-warning' });

    const buttonContainer = contentEl.createDiv({ cls: 'delete-confirm-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => this.close());

    const deleteBtn = buttonContainer.createEl('button', { text: 'Delete', cls: 'mod-warning' });
    deleteBtn.addEventListener('click', () => {
      this.onConfirm();
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/**
 * SupabaseUploaderPlugin
 *
 * Main Obsidian plugin class that orchestrates image uploads to Supabase Storage.
 */
export default class SupabaseUploaderPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private pasteHandler: PasteHandler | null = null;
  private dropHandler: DropHandler | null = null;
  private storageService: SupabaseStorageService | null = null;

  async onload(): Promise<void> {
    // Load settings
    await this.loadSettings();

    // Add settings tab
    this.addSettingTab(new SettingsTab(this.app, this));

    // Initialize handlers if configured
    this.initializeHandlers();

    // Register paste event handler
    this.registerEvent(
      this.app.workspace.on('editor-paste', async (evt: ClipboardEvent, editor: Editor, view: MarkdownView) => {
        if (this.pasteHandler) {
          await this.pasteHandler.handle(evt, editor, view);
        }
      })
    );

    // Register drop event handler
    this.registerEvent(
      this.app.workspace.on('editor-drop', async (evt: DragEvent, editor: Editor, view: MarkdownView) => {
        if (this.dropHandler) {
          await this.dropHandler.handle(evt, editor, view);
        }
      })
    );

    // Register editor context menu (right-click menu)
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView) => {
        const imageInfo = this.getImageLinkAtCursor(editor);
        if (imageInfo && this.storageService?.isSupabaseUrl(imageInfo.url)) {
          menu.addItem((item) => {
            item
              .setTitle('Delete from Supabase')
              .setIcon('trash-2')
              .onClick(() => {
                this.handleDeleteImage(editor, imageInfo);
              });
          });
        }
      })
    );
  }

  /**
   * Extract image link info at cursor position
   */
  private getImageLinkAtCursor(editor: Editor): { url: string; from: number; to: number; line: number } | null {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);

    // Match markdown image syntax: ![alt](url)
    const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(line)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Check if cursor is within this match
      if (cursor.ch >= start && cursor.ch <= end) {
        return {
          url: match[1],
          from: start,
          to: end,
          line: cursor.line,
        };
      }
    }

    return null;
  }

  /**
   * Handle delete image action
   */
  private handleDeleteImage(
    editor: Editor,
    imageInfo: { url: string; from: number; to: number; line: number }
  ): void {
    if (!this.storageService) {
      new Notice('Plugin not configured');
      return;
    }

    const storageService = this.storageService;
    const path = storageService.extractPathFromUrl(imageInfo.url);
    if (!path) {
      new Notice('Could not extract path from URL');
      return;
    }

    // Show confirmation modal
    new DeleteConfirmModal(this.app, path, () => {
      void (async () => {
        const result = await storageService.delete(path);

        if (result.success) {
          // Remove the image link from the editor
          const line = editor.getLine(imageInfo.line);
          const newLine = line.substring(0, imageInfo.from) + line.substring(imageInfo.to);
          editor.setLine(imageInfo.line, newLine);

          new Notice('Image deleted from Supabase');
        } else {
          new Notice(`Delete failed: ${result.message}`);
        }
      })();
    }).open();
  }

  onunload(): void {
    // Plugin cleanup
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    // Reinitialize handlers with new settings
    this.initializeHandlers();
  }

  /**
   * Check if the plugin is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.settings.supabaseUrl &&
      this.settings.supabaseAnonKey &&
      this.settings.bucketName
    );
  }

  /**
   * Initialize upload handlers with current settings
   */
  private initializeHandlers(): void {
    if (!this.isConfigured()) {
      this.pasteHandler = null;
      this.dropHandler = null;
      this.storageService = null;
      return;
    }

    // Create infrastructure components
    this.storageService = new SupabaseStorageService({
      url: this.settings.supabaseUrl,
      anonKey: this.settings.supabaseAnonKey,
      bucket: this.settings.bucketName,
    });

    const pathGenerator = new DateBasedPathGenerator();

    // Create use case
    const uploadUseCase = new UploadImageUseCase(this.storageService, pathGenerator);

    // Create handlers
    this.pasteHandler = new PasteHandler(uploadUseCase, () => this.isConfigured());
    this.dropHandler = new DropHandler(uploadUseCase, () => this.isConfigured());
  }
}
