import { Plugin, MarkdownView, Editor } from 'obsidian';
import { SettingsTab, PluginSettings, DEFAULT_SETTINGS } from '../settings/SettingsTab';
import { PasteHandler } from '../handlers/PasteHandler';
import { DropHandler } from '../handlers/DropHandler';
import { UploadImageUseCase } from '../../application/usecases/UploadImageUseCase';
import { SupabaseStorageService } from '../../infrastructure/storage/SupabaseStorageService';
import { DateBasedPathGenerator } from '../../infrastructure/path/DateBasedPathGenerator';

/**
 * SupabaseUploaderPlugin
 *
 * Main Obsidian plugin class that orchestrates image uploads to Supabase Storage.
 */
export default class SupabaseUploaderPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private pasteHandler: PasteHandler | null = null;
  private dropHandler: DropHandler | null = null;

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

    console.log('Supabase Image Uploader plugin loaded');
  }

  onunload(): void {
    console.log('Supabase Image Uploader plugin unloaded');
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
      return;
    }

    // Create infrastructure components
    const storageService = new SupabaseStorageService({
      url: this.settings.supabaseUrl,
      anonKey: this.settings.supabaseAnonKey,
      bucket: this.settings.bucketName,
    });

    const pathGenerator = new DateBasedPathGenerator();

    // Create use case
    const uploadUseCase = new UploadImageUseCase(storageService, pathGenerator);

    // Create handlers
    this.pasteHandler = new PasteHandler(uploadUseCase, () => this.isConfigured());
    this.dropHandler = new DropHandler(uploadUseCase, () => this.isConfigured());
  }
}
